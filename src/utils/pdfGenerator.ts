import { jsPDF } from 'jspdf';
import { MaintenanceReport, AppSettings, PartsOrderSheet } from '../types';
import { 
  hasAdjustmentSheetData, 
  hasProcedureSheetData, 
  hasPartsOrderSheetData, 
  hasMotorSheetData 
} from '../data/sheetsData';
import { 
  renderAdjustmentSheetPDF, 
  renderProcedureSheetPDF,
  renderPartsOrderSheetPDF,
  renderMotorSheetPDF
} from './pdfTables';

export interface PDFGenerationResult {
  blob: Blob;
  blobUrl: string;
  filename: string;
}

export async function generateMaintenancePDF(
  report: MaintenanceReport,
  settings: AppSettings
): Promise<PDFGenerationResult> {
  // A4 dimensions in mm: 210 x 297
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Helper colors (Dark Gold & Navy theme)
  const darkNavy = [15, 23, 42]; // #0f172a
  const slateGray = [71, 85, 105]; // #475569
  const lightBg = [248, 250, 252]; // #f8fafc
  const borderGray = [203, 213, 225]; // #cbd5e1
  const darkGold = [184, 134, 11]; // #b8860b Dourado Escuro
  const softGold = [218, 165, 32]; // #daa520

  // Function to draw running header on pages 2+
  const drawRunningHeader = (pageNum: number) => {
    if (pageNum === 1) return;
    pdf.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    pdf.rect(margin, 8, contentWidth, 8, 'F');
    pdf.setFillColor(darkGold[0], darkGold[1], darkGold[2]);
    pdf.rect(margin, 16, contentWidth, 0.8, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(255, 255, 255);
    pdf.text('RELATÓRIO TÉCNICO DE MANUTENÇÃO', margin + 4, 13.5);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`TAG: ${report.tag || 'N/A'}  |  OS: ${report.os || 'N/A'}`, pageWidth - margin - 4, 13.5, { align: 'right' });
  };

  // Function to draw running footer
  const drawFooter = (pageNum: number, totalPagesPlaceholder: boolean = false) => {
    const y = pageHeight - 9;
    pdf.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    pdf.setLineWidth(0.3);
    pdf.line(margin, y - 2, pageWidth - margin, y - 2);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
    const now = new Date().toLocaleString('pt-BR');
    pdf.text(`${settings.companyName || 'Relatório de Manutenção'} • Emitido em: ${now}`, margin, y + 2);
    // Page number
    pdf.text(`Página ${pageNum}`, pageWidth - margin, y + 2, { align: 'right' });
  };

  // ---------------- PAGE 1: HEADER & SUMMARY ----------------
  // Top Banner
  pdf.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  pdf.rect(margin, margin, contentWidth, 24, 'F');

  // Decorative Accent line (Dourado Escuro)
  pdf.setFillColor(darkGold[0], darkGold[1], darkGold[2]);
  pdf.rect(margin, margin + 24, contentWidth, 2, 'F');

  // Title inside banner
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(255, 255, 255);
  pdf.text('RELATÓRIO TÉCNICO DE MANUTENÇÃO', margin + 6, margin + 11);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(254, 243, 199); // Soft amber/gold
  pdf.text('INSPEÇÃO, DESMONTAGEM E ANÁLISE DE EQUIPAMENTOS', margin + 6, margin + 18);

  // Status Badge in Top Right
  const statusLabels: Record<string, string> = {
    EM_ANDAMENTO: 'EM ANDAMENTO',
    CONCLUIDO: 'CONCLUÍDO',
    AGUARDANDO_PECAS: 'AGUARDANDO PEÇAS',
    INSPECAO: 'EM INSPEÇÃO',
  };
  const statusText = statusLabels[report.status] || report.status;
  pdf.setFillColor(darkGold[0], darkGold[1], darkGold[2]);
  pdf.roundedRect(pageWidth - margin - 46, margin + 6, 40, 12, 2, 2, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.5);
  pdf.setTextColor(255, 255, 255);
  pdf.text(statusText, pageWidth - margin - 26, margin + 13.5, { align: 'center' });

  // Metadata Grid Box
  let currentY = margin + 30;
  pdf.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  pdf.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  pdf.setLineWidth(0.4);
  pdf.roundedRect(margin, currentY, contentWidth, 24, 2, 2, 'FD');

  // Column divider lines
  const col1X = margin + 4;
  const col2X = margin + contentWidth / 2 + 2;

  // Metadata items with automatic line-break wrapping to prevent text overflow
  const drawMetaField = (label: string, value: string, x: number, y: number, maxW: number = (contentWidth / 2) - 8) => {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
    pdf.text(label.toUpperCase(), x, y);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9.5);
    pdf.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    const splitVal = pdf.splitTextToSize(value || '---', maxW);
    pdf.text(splitVal, x, y + 4.5);
  };

  drawMetaField('TAG do Equipamento', report.tag, col1X, currentY + 7);
  drawMetaField('Ordem de Serviço (OS)', report.os, col2X, currentY + 7);

  drawMetaField('Data de Início', report.startDate, col1X, currentY + 18);
  drawMetaField('Técnico Responsável', report.technician || 'Carlos A. Castro', col2X, currentY + 18);

  // General Comment / Scope Card
  currentY += 28;
  pdf.setFillColor(241, 245, 249);
  pdf.setDrawColor(darkGold[0], darkGold[1], darkGold[2]);
  pdf.setLineWidth(0.8);
  
  // Calculate text height for general comment with automatic text wrapping
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  const splitGeneralComment = pdf.splitTextToSize(report.generalComment || 'Nenhum comentário geral registrado.', contentWidth - 14);
  const commentBoxHeight = Math.max(24, splitGeneralComment.length * 4.6 + 12);

  pdf.roundedRect(margin, currentY, contentWidth, commentBoxHeight, 2, 2, 'FD');

  // Left accent line (Dourado Escuro)
  pdf.setFillColor(darkGold[0], darkGold[1], darkGold[2]);
  pdf.rect(margin, currentY, 3, commentBoxHeight, 'F');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(darkGold[0], darkGold[1], darkGold[2]);
  pdf.text('COMENTÁRIO GERAL & ESCOPO DOS TRABALHOS', margin + 6, currentY + 6);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  pdf.text(splitGeneralComment, margin + 6, currentY + 12);

  currentY += commentBoxHeight + 6;

  // Section Title: Registros Fotográficos
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10.5);
  pdf.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  pdf.text(`REGISTROS FOTOGRÁFICOS DE INSPEÇÃO (${report.photos.length} FOTOS)`, margin, currentY + 4);
  pdf.setDrawColor(darkGold[0], darkGold[1], darkGold[2]);
  pdf.setLineWidth(0.6);
  pdf.line(margin, currentY + 6, margin + 40, currentY + 6);

  currentY += 10;

  // ---------------- PHOTO PAGES ----------------
  let pageCount = 1;
  drawFooter(pageCount);

  // Render high-res photos with automatic text wrapping in comments
  for (let i = 0; i < report.photos.length; i++) {
    const photo = report.photos[i];
    pdf.addPage();
    pageCount++;
    drawRunningHeader(pageCount);

    const photoCardY = 20;
    const availableHeight = pageHeight - photoCardY - 24; // space for footer

    // Photo Card Container
    pdf.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
    pdf.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    pdf.setLineWidth(0.4);
    pdf.roundedRect(margin, photoCardY, contentWidth, availableHeight, 3, 3, 'FD');

    // Photo Header Inside Card
    pdf.setFillColor(241, 245, 249);
    pdf.roundedRect(margin, photoCardY, contentWidth, 10, 3, 3, 'F');
    pdf.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    pdf.line(margin, photoCardY + 10, margin + contentWidth, photoCardY + 10);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    pdf.text(`REGISTRO FOTOGRÁFICO #${String(i + 1).padStart(2, '0')}`, margin + 6, photoCardY + 6.5);

    if (photo.tag) {
      pdf.setFillColor(darkGold[0], darkGold[1], darkGold[2]);
      pdf.roundedRect(margin + 60, photoCardY + 2, 22, 6, 1, 1, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(6.5);
      pdf.setTextColor(255, 255, 255);
      pdf.text(photo.tag.toUpperCase(), margin + 71, photoCardY + 6, { align: 'center' });
    }

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
    pdf.text(photo.timestamp || '', pageWidth - margin - 6, photoCardY + 6.5, { align: 'right' });

    // Calculate Photo & Comment Area with dynamic text wrapping
    const photoMaxW = contentWidth - 12;
    const captionText = photo.caption && photo.caption.trim().length > 0
      ? photo.caption
      : 'Sem observações adicionais para este item.';
    
    // Split caption so text wraps cleanly and never escapes the box
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    const splitCaption = pdf.splitTextToSize(captionText, photoMaxW - 12);
    const neededCommentH = Math.max(26, splitCaption.length * 4.6 + 12);
    const commentBoxH = Math.min(neededCommentH, 65); // Cap to preserve photo area
    const photoMaxH = availableHeight - 10 - commentBoxH - 8;

    // Center the photo within the frame
    try {
      const imgX = margin + 6;
      const imgY = photoCardY + 14;

      // Draw photo inner background/border
      pdf.setFillColor(230, 235, 240);
      pdf.rect(imgX, imgY, photoMaxW, photoMaxH, 'F');

      pdf.addImage(
        photo.dataUrl,
        'JPEG',
        imgX,
        imgY,
        photoMaxW,
        photoMaxH,
        undefined,
        'FAST'
      );
      
      // Thin crisp photo border
      pdf.setDrawColor(180, 195, 210);
      pdf.setLineWidth(0.3);
      pdf.rect(imgX, imgY, photoMaxW, photoMaxH, 'D');
    } catch (err) {
      console.error('Error adding photo to PDF:', err);
    }

    // Comment Box Below Photo with dynamic height and wrapped lines
    const commentBoxY = photoCardY + 14 + photoMaxH + 4;
    pdf.setFillColor(255, 255, 255);
    pdf.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    pdf.setLineWidth(0.4);
    pdf.roundedRect(margin + 6, commentBoxY, photoMaxW, commentBoxH - 2, 2, 2, 'FD');

    // Label
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(darkGold[0], darkGold[1], darkGold[2]);
    pdf.text('COMENTÁRIO TÉCNICO:', margin + 10, commentBoxY + 6);

    // Text content with automatic line breaks
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    pdf.text(splitCaption, margin + 10, commentBoxY + 12);

    drawFooter(pageCount);
  }

  // ---------------- TECHNICAL TABLES (FOLHA DE AJUSTES & PROCEDIMENTOS) ----------------
  // If Adjustment Sheet is enabled or filled, render it at the end of the report
  if (report.adjustmentSheet && (report.adjustmentSheet.enabled || hasAdjustmentSheetData(report.adjustmentSheet))) {
    pageCount = renderAdjustmentSheetPDF(pdf, report.adjustmentSheet, report, drawRunningHeader, drawFooter);
  }

  // If Procedure Redutores is enabled or filled
  if (report.procedureRedutores && (report.procedureRedutores.enabled || hasProcedureSheetData(report.procedureRedutores))) {
    pageCount = renderProcedureSheetPDF(pdf, report.procedureRedutores, report, drawRunningHeader, drawFooter);
  }

  // If Procedure Bombas is enabled or filled
  if (report.procedureBombas && (report.procedureBombas.enabled || hasProcedureSheetData(report.procedureBombas))) {
    pageCount = renderProcedureSheetPDF(pdf, report.procedureBombas, report, drawRunningHeader, drawFooter);
  }

  // If Procedure Mancais is enabled or filled
  if (report.procedureMancais && (report.procedureMancais.enabled || hasProcedureSheetData(report.procedureMancais))) {
    pageCount = renderProcedureSheetPDF(pdf, report.procedureMancais, report, drawRunningHeader, drawFooter);
  }

  // If Parts Order Sheet is enabled or filled
  if (report.partsOrderSheet && (report.partsOrderSheet.enabled || hasPartsOrderSheetData(report.partsOrderSheet))) {
    pageCount = renderPartsOrderSheetPDF(pdf, report.partsOrderSheet, report, drawRunningHeader, drawFooter);
  }

  // If Electric Motor Sheet is enabled or filled
  if (report.motorSheet && (report.motorSheet.enabled || hasMotorSheetData(report.motorSheet))) {
    pageCount = renderMotorSheetPDF(pdf, report.motorSheet, report, drawRunningHeader, drawFooter);
  }

  // ---------------- FINAL PAGE: TECHNICAL CONCLUSION (NO SIGNATURE BLOCK AS REQUESTED) ----------------
  // User requested: "retire a parte de assinatura no final dos laudos"
  pdf.addPage();
  pageCount = pdf.getNumberOfPages();
  drawRunningHeader(pageCount);

  let finalY = 24;
  pdf.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  pdf.rect(margin, finalY, contentWidth, 10, 'F');
  pdf.setFillColor(darkGold[0], darkGold[1], darkGold[2]);
  pdf.rect(margin, finalY + 10, contentWidth, 1.5, 'F');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8.5);
  pdf.setTextColor(255, 255, 255);
  pdf.text('CONCLUSÃO TÉCNICA E ENCERRAMENTO DO LAUDO', margin + 6, finalY + 6.5);

  finalY += 18;
  pdf.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  pdf.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  pdf.roundedRect(margin, finalY, contentWidth, 68, 2, 2, 'FD');

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  const conclusionText = [
    `• O presente relatório técnico documenta as etapas de inspeção e intervenção realizadas no equipamento TAG ${report.tag || '---'}.`,
    `• Todas as evidências fotográficas foram coletadas em campo com resolução máxima e inspecionadas conforme os padrões de manutenção.`,
    `• Ordem de Serviço de referência: OS ${report.os || '---'}.`,
    `• Recomenda-se o acompanhamento periódico dos itens apontados com anomalia nas fotos de inspeção.`,
    `• Laudo técnico validado eletronicamente para fins de histórico e rastreabilidade de manutenção mecânica.`,
  ];
  let textY = finalY + 8;
  conclusionText.forEach((line) => {
    const wrappedLine = pdf.splitTextToSize(line, contentWidth - 14);
    pdf.text(wrappedLine, margin + 6, textY);
    textY += (wrappedLine.length * 4.5) + 3;
  });

  // Technical metadata validation box (replacing signatures)
  finalY += 76;
  pdf.setFillColor(241, 245, 249);
  pdf.setDrawColor(darkGold[0], darkGold[1], darkGold[2]);
  pdf.setLineWidth(0.6);
  pdf.roundedRect(margin, finalY, contentWidth, 26, 2, 2, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(darkGold[0], darkGold[1], darkGold[2]);
  pdf.text('DADOS DE RASTREABILIDADE TÉCNICA', margin + 6, finalY + 6.5);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  pdf.text(`Técnico Responsável: ${report.technician || 'Carlos A. Castro'}`, margin + 6, finalY + 13);
  pdf.text(`TAG: ${report.tag || '---'}  |  OS: ${report.os || '---'}  |  Data: ${report.startDate || '---'}`, margin + 6, finalY + 18.5);
  pdf.text(`Documento emitido digitalmente pela equipe de Engenharia de Manutenção.`, margin + 6, finalY + 24);

  drawFooter(pageCount);

  // Update total pages dynamically
  const totalPages = pdf.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    pdf.setPage(p);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
    // Overwrite page number with "Página P de N"
    const footerY = pageHeight - 7;
    pdf.setFillColor(255, 255, 255);
    pdf.rect(pageWidth - margin - 35, footerY - 4, 35, 6, 'F');
    pdf.text(`Página ${p} de ${totalPages}`, pageWidth - margin, footerY, { align: 'right' });
  }

  const cleanFilename = `Relatorio_Tecnico_OS_${(report.os || 'GERAL').replace(/[^a-zA-Z0-9]/g, '_')}_TAG_${(report.tag || 'EQUIP').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  const blob = pdf.output('blob');
  const blobUrl = URL.createObjectURL(blob);

  return {
    blob,
    blobUrl,
    filename: cleanFilename,
  };
}

/**
 * Converts a Blob to a Base64 string for Android native bridge transmission.
 */
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1] || '';
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Generates an institutional, standalone PDF for the Parts Order Sheet (LISTA P/ PEDIDO DE PEÇAS)
 * to be attached to Gmail on Android devices and shared with warehouse / purchasing teams.
 */
export async function generatePartsOrderPDF(
  sheet: PartsOrderSheet,
  reportInfo: {
    tag: string;
    os: string;
    equipment?: string;
    technician?: string;
  },
  settings?: Partial<AppSettings>
): Promise<PDFGenerationResult> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Kinross Corporate Palette
  const darkNavy = [15, 23, 42]; // #0f172a
  const slateGray = [71, 85, 105]; // #475569
  const lightBg = [248, 250, 252]; // #f8fafc
  const borderGray = [203, 213, 225]; // #cbd5e1
  const darkGold = [184, 134, 11]; // #b8860b Kinross Dark Gold
  const kinrossGold = [202, 138, 4]; // #ca8a04
  const lightGoldBg = [254, 252, 232]; // #fefce8

  const tagVal = sheet.tag || reportInfo.tag || 'N/A';
  const osVal = sheet.os || reportInfo.os || 'N/A';
  const equipVal = sheet.equipamento || reportInfo.equipment || 'N/A';
  const solicitanteVal = sheet.solicitante || reportInfo.technician || 'Carlos A. Castro';
  const dataVal = sheet.data || new Date().toISOString().split('T')[0];
  const areaVal = sheet.area || 'Oficina Central de Manutenção';

  const drawRunningHeader = (pageNum: number) => {
    if (pageNum === 1) return;
    pdf.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    pdf.rect(margin, 8, contentWidth, 8, 'F');
    pdf.setFillColor(darkGold[0], darkGold[1], darkGold[2]);
    pdf.rect(margin, 16, contentWidth, 0.8, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(255, 255, 255);
    pdf.text('LISTA P/ PEDIDO DE PEÇAS • OFICINA CENTRAL', margin + 4, 13.5);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`TAG: ${tagVal}  |  OS: ${osVal}`, pageWidth - margin - 4, 13.5, { align: 'right' });
  };

  const drawFooter = (pageNum: number) => {
    const y = pageHeight - 9;
    pdf.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    pdf.setLineWidth(0.3);
    pdf.line(margin, y - 2, pageWidth - margin, y - 2);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
    const now = new Date().toLocaleString('pt-BR');
    pdf.text(`${settings?.companyName || 'Kinross Brasil Mineração • Engenharia de Manutenção'} • Emitido em: ${now}`, margin, y + 2);
    pdf.text(`Página ${pageNum}`, pageWidth - margin, y + 2, { align: 'right' });
  };

  // ---------------- PAGE 1 ----------------
  let currentY = margin;

  // Header Banner
  pdf.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  pdf.rect(margin, currentY, contentWidth, 24, 'F');

  pdf.setFillColor(darkGold[0], darkGold[1], darkGold[2]);
  pdf.rect(margin, currentY + 24, contentWidth, 2, 'F');

  // Title inside banner
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(13);
  pdf.setTextColor(255, 255, 255);
  pdf.text('LISTA P/ PEDIDO DE PEÇAS', margin + 6, currentY + 10);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(254, 243, 199);
  pdf.text('OFICINA CENTRAL DE MANUTENÇÃO INDUSTRIAL • REQUISIÇÃO OFICIAL', margin + 6, currentY + 17);

  // Status Badge
  pdf.setFillColor(darkGold[0], darkGold[1], darkGold[2]);
  pdf.roundedRect(pageWidth - margin - 42, currentY + 6, 36, 11, 2, 2, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(255, 255, 255);
  pdf.text('REQUISIÇÃO', pageWidth - margin - 24, currentY + 13, { align: 'center' });

  currentY += 31;

  // Metadata Grid: 2 rows of 3 columns
  const metaRowHeight = 7.5;
  const colWidth = contentWidth / 3;

  // Row 1: DATA | TAG | EQUIPAMENTO
  const metaRow1 = [
    { label: 'DATA', value: dataVal },
    { label: 'TAG', value: tagVal },
    { label: 'EQUIPAMENTO', value: equipVal },
  ];

  pdf.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  pdf.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  pdf.setLineWidth(0.3);
  pdf.rect(margin, currentY, contentWidth, metaRowHeight, 'FD');

  metaRow1.forEach((item, idx) => {
    const colX = margin + idx * colWidth;
    if (idx > 0) pdf.line(colX, currentY, colX, currentY + metaRowHeight);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(6.5);
    pdf.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
    pdf.text(`${item.label}:`, colX + 3, currentY + 3.2);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    pdf.text(item.value || '---', colX + 24, currentY + 5.5);
  });
  currentY += metaRowHeight;

  // Row 2: POR (Solicitante) | OS | ÁREA
  const metaRow2 = [
    { label: 'POR', value: solicitanteVal },
    { label: 'OS', value: osVal },
    { label: 'ÁREA', value: areaVal },
  ];

  pdf.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  pdf.rect(margin, currentY, contentWidth, metaRowHeight, 'FD');

  metaRow2.forEach((item, idx) => {
    const colX = margin + idx * colWidth;
    if (idx > 0) pdf.line(colX, currentY, colX, currentY + metaRowHeight);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(6.5);
    pdf.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
    pdf.text(`${item.label}:`, colX + 3, currentY + 3.2);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    pdf.text(item.value || '---', colX + 24, currentY + 5.5);
  });
  currentY += metaRowHeight + 4;

  // Table Columns Setup
  const colW_item = 14;
  const colW_codigo = 36;
  const colW_qtd = 26;
  const colW_desc = contentWidth - (colW_item + colW_codigo + colW_qtd);

  const drawTableHeader = (y: number) => {
    pdf.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    pdf.rect(margin, y, contentWidth, 7, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    pdf.setTextColor(255, 255, 255);

    let curX = margin;
    pdf.text('Nº', curX + colW_item / 2, y + 4.8, { align: 'center' });
    curX += colW_item;
    pdf.text('CÓDIGO (SAP / INTERNO)', curX + colW_codigo / 2, y + 4.8, { align: 'center' });
    curX += colW_codigo;
    pdf.text('QUANTIDADE', curX + colW_qtd / 2, y + 4.8, { align: 'center' });
    curX += colW_qtd;
    pdf.text('DESCRIÇÃO DO COMPONENTE / PART NUMBER', curX + 4, y + 4.8);
    return y + 7;
  };

  currentY = drawTableHeader(currentY);

  // Filter items or combine with padding up to 14 rows
  const validItems = sheet.items.filter(
    (it) => it.codigo.trim() || it.quantidade.trim() || it.descricaoPartNumber.trim()
  );

  const rows: Array<{ id: string; codigo: string; quantidade: string; descricaoPartNumber: string }> = [...sheet.items];
  while (rows.length < 14) {
    rows.push({
      id: `pad_${rows.length}`,
      codigo: '',
      quantidade: '',
      descricaoPartNumber: '',
    });
  }

  let pageNum = 1;
  const itemRowHeight = 9.2;

  rows.forEach((item, index) => {
    // Pagination safety
    if (currentY + itemRowHeight > pageHeight - 38) {
      drawFooter(pageNum);
      pdf.addPage();
      pageNum = pdf.getNumberOfPages();
      drawRunningHeader(pageNum);
      currentY = 22;
      currentY = drawTableHeader(currentY);
    }

    const isZebra = index % 2 === 1;
    if (isZebra) {
      pdf.setFillColor(248, 250, 252);
    } else {
      pdf.setFillColor(255, 255, 255);
    }
    pdf.rect(margin, currentY, contentWidth, itemRowHeight, 'F');

    pdf.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    pdf.setLineWidth(0.2);
    pdf.rect(margin, currentY, contentWidth, itemRowHeight, 'D');

    // Column separators
    let sepX = margin + colW_item;
    pdf.line(sepX, currentY, sepX, currentY + itemRowHeight);
    sepX += colW_codigo;
    pdf.line(sepX, currentY, sepX, currentY + itemRowHeight);
    sepX += colW_qtd;
    pdf.line(sepX, currentY, sepX, currentY + itemRowHeight);

    // Number
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
    pdf.text(String(index + 1).padStart(2, '0'), margin + colW_item / 2, currentY + 5.5, { align: 'center' });

    // Código
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    if (item.codigo) {
      pdf.text(item.codigo, margin + colW_item + colW_codigo / 2, currentY + 5.5, { align: 'center' });
    }

    // Quantidade
    if (item.quantidade) {
      pdf.text(item.quantidade, margin + colW_item + colW_codigo + colW_qtd / 2, currentY + 5.5, { align: 'center' });
    }

    // Descrição / Part Number
    if (item.descricaoPartNumber) {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
      const splitDesc = pdf.splitTextToSize(item.descricaoPartNumber, colW_desc - 6);
      pdf.text(splitDesc.slice(0, 2), margin + colW_item + colW_codigo + colW_qtd + 3, currentY + 4);
    }

    currentY += itemRowHeight;
  });

  // Summary and Sign-off Box
  if (currentY + 32 > pageHeight - 16) {
    drawFooter(pageNum);
    pdf.addPage();
    pageNum = pdf.getNumberOfPages();
    drawRunningHeader(pageNum);
    currentY = 22;
  } else {
    currentY += 3;
  }

  // Verification Box
  pdf.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  pdf.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(margin, currentY, contentWidth, 24, 1.5, 1.5, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.5);
  pdf.setTextColor(darkGold[0], darkGold[1], darkGold[2]);
  pdf.text('DADOS DA REQUISIÇÃO & ENCAMINHAMENTO TÉCNICO', margin + 4, currentY + 5.5);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  pdf.text(`Total de Itens Requisitados: ${validItems.length} item(ns) cadastrados`, margin + 4, currentY + 11.5);
  
  const recipientsText = (sheet.recipientEmails && sheet.recipientEmails.length > 0)
    ? sheet.recipientEmails.join(', ')
    : 'paulo.sousa@kinross.com';
  const wrappedRecipients = pdf.splitTextToSize(`Destinatários do E-mail: ${recipientsText}`, contentWidth - 8);
  pdf.text(wrappedRecipients, margin + 4, currentY + 16.5);

  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(6.5);
  pdf.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
  pdf.text(`Material solicitado por ${solicitanteVal} para intervenção na TAG ${tagVal} (OS ${osVal}). Documento gerado e validado digitalmente.`, margin + 4, currentY + 21.5);

  drawFooter(pageNum);

  // Overwrite total page numbers
  const totalPages = pdf.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    pdf.setPage(p);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
    const footerY = pageHeight - 7;
    pdf.setFillColor(255, 255, 255);
    pdf.rect(pageWidth - margin - 35, footerY - 4, 35, 6, 'F');
    pdf.text(`Página ${p} de ${totalPages}`, pageWidth - margin, footerY, { align: 'right' });
  }

  const cleanFilename = `Pedido_Pecas_OS_${(osVal || 'GERAL').replace(/[^a-zA-Z0-9]/g, '_')}_TAG_${(tagVal || 'EQUIP').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  const blob = pdf.output('blob');
  const blobUrl = URL.createObjectURL(blob);

  return {
    blob,
    blobUrl,
    filename: cleanFilename,
  };
}
