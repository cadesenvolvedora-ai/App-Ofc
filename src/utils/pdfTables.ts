import { jsPDF } from 'jspdf';
import { 
  ReductionAdjustmentSheet, 
  ProcedureSheet, 
  MaintenanceReport,
  PartsOrderSheet,
  ElectricMotorSheet
} from '../types';

interface PDFTheme {
  darkNavy: number[];
  excelGreen: number[];
  kinrossGold: number[];
  slateGray: number[];
  lightBg: number[];
  borderGray: number[];
  tableHeaderBg: number[];
  tableZebraBg: number[];
}

const theme: PDFTheme = {
  darkNavy: [15, 23, 42],
  excelGreen: [16, 124, 65], // #107c41
  kinrossGold: [184, 134, 11], // #b8860b Dark Gold / Dourado Escuro
  slateGray: [71, 85, 105],
  lightBg: [248, 250, 252],
  borderGray: [203, 213, 225],
  tableHeaderBg: [226, 232, 240],
  tableZebraBg: [241, 245, 249],
};

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 12;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

/**
 * Draws institutional Kinross / Excel-styled banner on top of sheets
 */
function drawSheetBanner(
  pdf: jsPDF,
  title: string,
  y: number,
  accentColor: number[] = theme.kinrossGold
): number {
  // Main banner bar
  pdf.setFillColor(theme.darkNavy[0], theme.darkNavy[1], theme.darkNavy[2]);
  pdf.rect(MARGIN, y, CONTENT_WIDTH, 14, 'F');

  // Accent stripe (Dourado Escuro)
  pdf.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
  pdf.rect(MARGIN, y + 14, CONTENT_WIDTH, 1.5, 'F');

  // Left: Kinross
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(theme.kinrossGold[0], theme.kinrossGold[1], theme.kinrossGold[2]);
  pdf.text('KINROSS', MARGIN + 4, y + 6.5);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  pdf.setTextColor(203, 213, 225);
  pdf.text('Paracatu', MARGIN + 4, y + 11);

  // Center: Title
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(255, 255, 255);
  pdf.text(title.toUpperCase(), PAGE_WIDTH / 2, y + 8.5, { align: 'center' });

  // Right: Oficina Central
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8.5);
  pdf.setTextColor(255, 255, 255);
  pdf.text('OFICINA CENTRAL', PAGE_WIDTH - MARGIN - 4, y + 8.5, { align: 'right' });

  return y + 18;
}

/**
 * Draws subheader with metadata (OS, TAG, COMPONENTE, etc.)
 */
function drawMetadataGrid(
  pdf: jsPDF,
  items: { label: string; value: string }[],
  y: number
): number {
  const rowHeight = 10;
  const colWidth = CONTENT_WIDTH / items.length;

  pdf.setFillColor(theme.lightBg[0], theme.lightBg[1], theme.lightBg[2]);
  pdf.setDrawColor(theme.borderGray[0], theme.borderGray[1], theme.borderGray[2]);
  pdf.setLineWidth(0.3);
  pdf.rect(MARGIN, y, CONTENT_WIDTH, rowHeight, 'FD');

  items.forEach((item, index) => {
    const colX = MARGIN + index * colWidth;
    if (index > 0) {
      pdf.line(colX, y, colX, y + rowHeight);
    }
    // Label
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(6.5);
    pdf.setTextColor(theme.slateGray[0], theme.slateGray[1], theme.slateGray[2]);
    pdf.text(item.label.toUpperCase(), colX + 2, y + 3.5);

    // Value with text wrapping
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    pdf.setTextColor(theme.darkNavy[0], theme.darkNavy[1], theme.darkNavy[2]);
    const cleanVal = item.value || '---';
    const splitVal = pdf.splitTextToSize(cleanVal, colWidth - 3);
    pdf.text(splitVal[0] || '---', colX + 2, y + 7.5);
  });

  return y + rowHeight + 3;
}

/**
 * Renders FOLHA DE AJUSTES - REDUTORES in PDF format
 */
export function renderAdjustmentSheetPDF(
  pdf: jsPDF,
  sheet: ReductionAdjustmentSheet,
  report: MaintenanceReport,
  drawRunningHeader: (p: number) => void,
  drawFooter: (p: number) => void
): number {
  pdf.addPage();
  const pageNum = pdf.getNumberOfPages();
  drawRunningHeader(pageNum);

  let currentY = 22;
  currentY = drawSheetBanner(pdf, 'FOLHA DE AJUSTES - REDUTORES', currentY, theme.excelGreen);

  // Metadata Grid
  const metaItems = [
    { label: 'OS', value: report.os || '---' },
    { label: 'COMPONENTE', value: sheet.componente || 'REDUTOR' },
    { label: 'TIPO OS', value: sheet.tipoOs || 'PREVENTIVA' },
    { label: 'TAG', value: report.tag || '---' },
    { label: 'N UNID', value: sheet.nUnid || '---' },
    { label: 'ID / PATRIM', value: sheet.idPatrim || '---' },
  ];
  currentY = drawMetadataGrid(pdf, metaItems, currentY);

  pdf.setDrawColor(theme.borderGray[0], theme.borderGray[1], theme.borderGray[2]);
  pdf.setLineWidth(0.2);

  // SECTION 1: TABELA DE EIXOS (BASE ROLAMENTO)
  const drawSectionHeader = (title: string, y: number) => {
    pdf.setFillColor(theme.darkNavy[0], theme.darkNavy[1], theme.darkNavy[2]);
    pdf.rect(MARGIN, y, CONTENT_WIDTH, 5.5, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.setTextColor(255, 255, 255);
    pdf.text(title.toUpperCase(), MARGIN + 3, y + 4);
    return y + 5.5;
  };

  currentY = drawSectionHeader('1. TABELA DE EIXOS (Base do Rolamento)', currentY);

  // Subheader
  pdf.setFillColor(theme.tableHeaderBg[0], theme.tableHeaderBg[1], theme.tableHeaderBg[2]);
  pdf.rect(MARGIN, currentY, CONTENT_WIDTH, 5, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(6.5);
  pdf.setTextColor(theme.slateGray[0], theme.slateGray[1], theme.slateGray[2]);
  pdf.text('EIXO', MARGIN + 2, currentY + 3.5);
  pdf.text('L.A. (MEDIDA / PROJETO / FOLGA)', MARGIN + 35, currentY + 3.5);
  pdf.text('L.O.A. (MEDIDA / PROJETO / FOLGA)', MARGIN + 95, currentY + 3.5);
  pdf.text('COMENTÁRIOS', MARGIN + 145, currentY + 3.5);
  currentY += 5;

  // Rows for Eixo
  const eixoRows = [
    { name: 'Eixo A.R.', data: sheet.eixo.eixoAR },
    { name: 'Eixo Int.', data: sheet.eixo.eixoInt },
    { name: 'Eixo B.R.', data: sheet.eixo.eixoBR },
  ];

  eixoRows.forEach((r, idx) => {
    if (idx % 2 === 1) {
      pdf.setFillColor(theme.tableZebraBg[0], theme.tableZebraBg[1], theme.tableZebraBg[2]);
      pdf.rect(MARGIN, currentY, CONTENT_WIDTH, 5.5, 'F');
    }
    pdf.rect(MARGIN, currentY, CONTENT_WIDTH, 5.5, 'S');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    pdf.setTextColor(theme.darkNavy[0], theme.darkNavy[1], theme.darkNavy[2]);
    pdf.text(r.name, MARGIN + 2, currentY + 4);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6.8);
    const laStr = `Medida L.A.: ${r.data.la || '-'}`;
    const loaStr = `Medida L.O.A.: ${r.data.loa || '-'}`;
    pdf.text(laStr, MARGIN + 35, currentY + 4);
    pdf.text(loaStr, MARGIN + 95, currentY + 4);
    pdf.text(idx === 0 ? (sheet.eixo.comentarios || '---') : '', MARGIN + 145, currentY + 4);

    currentY += 5.5;
  });

  currentY += 3;

  // SECTION 2: TABELA DE MANCAIS (CARCAÇA)
  currentY = drawSectionHeader('2. TABELA DE MANCAIS (Carcaça)', currentY);

  pdf.setFillColor(theme.tableHeaderBg[0], theme.tableHeaderBg[1], theme.tableHeaderBg[2]);
  pdf.rect(MARGIN, currentY, CONTENT_WIDTH, 5, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(6.5);
  pdf.setTextColor(theme.slateGray[0], theme.slateGray[1], theme.slateGray[2]);
  pdf.text('CARCAÇA / ALOJAMENTO', MARGIN + 2, currentY + 3.5);
  pdf.text('L.A. (MEDIDA | PROJETO)', MARGIN + 45, currentY + 3.5);
  pdf.text('L.O.A. (MEDIDA | PROJETO)', MARGIN + 105, currentY + 3.5);
  pdf.text('OBSERVAÇÕES', MARGIN + 155, currentY + 3.5);
  currentY += 5;

  const mancalRows = [
    { name: 'Carcaça Eixo A.R.', data: sheet.mancal.carcacaAR },
    { name: 'Carcaça Eixo Int.', data: sheet.mancal.carcacaInt },
    { name: 'Carcaça Eixo B.R.', data: sheet.mancal.carcacaBR },
  ];

  mancalRows.forEach((r, idx) => {
    if (idx % 2 === 1) {
      pdf.setFillColor(theme.tableZebraBg[0], theme.tableZebraBg[1], theme.tableZebraBg[2]);
      pdf.rect(MARGIN, currentY, CONTENT_WIDTH, 5.5, 'F');
    }
    pdf.rect(MARGIN, currentY, CONTENT_WIDTH, 5.5, 'S');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    pdf.setTextColor(theme.darkNavy[0], theme.darkNavy[1], theme.darkNavy[2]);
    pdf.text(r.name, MARGIN + 2, currentY + 4);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6.8);
    const laStr = `Med: ${r.data.laMedida || '-'} | Proj: ${r.data.laProjeto || '-'}`;
    const loaStr = `Med: ${r.data.loaMedida || '-'} | Proj: ${r.data.loaProjeto || '-'}`;
    pdf.text(laStr, MARGIN + 45, currentY + 4);
    pdf.text(loaStr, MARGIN + 105, currentY + 4);
    pdf.text(idx === 0 ? (sheet.mancal.comentarios || '---') : '', MARGIN + 155, currentY + 4);

    currentY += 5.5;
  });

  currentY += 3;

  // SECTION 3: ROLAMENTOS
  currentY = drawSectionHeader('3. ESPECIFICAÇÃO DE ROLAMENTOS & FOLGA RADIAL', currentY);

  pdf.setFillColor(theme.tableHeaderBg[0], theme.tableHeaderBg[1], theme.tableHeaderBg[2]);
  pdf.rect(MARGIN, currentY, CONTENT_WIDTH, 5, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(6.5);
  pdf.setTextColor(theme.slateGray[0], theme.slateGray[1], theme.slateGray[2]);
  pdf.text('EIXO', MARGIN + 2, currentY + 3.5);
  pdf.text('L.A. (NÚMERO DO ROLAMENTO | FOLGA RADIAL)', MARGIN + 40, currentY + 3.5);
  pdf.text('L.O.A. (NÚMERO DO ROLAMENTO | FOLGA RADIAL)', MARGIN + 110, currentY + 3.5);
  currentY += 5;

  const rolRows = [
    { name: 'Eixo A.R.', data: sheet.rolamentos.eixoAR },
    { name: 'Eixo Int.', data: sheet.rolamentos.eixoInt },
    { name: 'Eixo B.R.', data: sheet.rolamentos.eixoBR },
  ];

  rolRows.forEach((r, idx) => {
    if (idx % 2 === 1) {
      pdf.setFillColor(theme.tableZebraBg[0], theme.tableZebraBg[1], theme.tableZebraBg[2]);
      pdf.rect(MARGIN, currentY, CONTENT_WIDTH, 5.5, 'F');
    }
    pdf.rect(MARGIN, currentY, CONTENT_WIDTH, 5.5, 'S');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    pdf.setTextColor(theme.darkNavy[0], theme.darkNavy[1], theme.darkNavy[2]);
    pdf.text(r.name, MARGIN + 2, currentY + 4);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6.8);
    const laStr = `Nº: ${r.data.laNum || '-'} | Folga: ${r.data.laFolga || '-'}`;
    const loaStr = `Nº: ${r.data.loaNum || '-'} | Folga: ${r.data.loaFolga || '-'}`;
    pdf.text(laStr, MARGIN + 40, currentY + 4);
    pdf.text(loaStr, MARGIN + 110, currentY + 4);

    currentY += 5.5;
  });

  currentY += 3;

  // SECTION 4: FOLGAS AXIAIS & ENGRENAMENTO / CARCAÇA (SPLIT 2 COLUMNS)
  const halfWidth = (CONTENT_WIDTH - 3) / 2;

  // Col 1: Folgas Axiais
  pdf.setFillColor(theme.darkNavy[0], theme.darkNavy[1], theme.darkNavy[2]);
  pdf.rect(MARGIN, currentY, halfWidth, 5.5, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.5);
  pdf.setTextColor(255, 255, 255);
  pdf.text('4. FOLGAS AXIAIS', MARGIN + 3, currentY + 4);

  // Col 2: Engrenamento & Carcaça
  const col2X = MARGIN + halfWidth + 3;
  pdf.setFillColor(theme.darkNavy[0], theme.darkNavy[1], theme.darkNavy[2]);
  pdf.rect(col2X, currentY, halfWidth, 5.5, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.5);
  pdf.setTextColor(255, 255, 255);
  pdf.text('5. ENGRENAMENTO & CARCAÇA', col2X + 3, currentY + 4);

  currentY += 5.5;

  // Table header for Folgas Axiais
  pdf.setFillColor(theme.tableHeaderBg[0], theme.tableHeaderBg[1], theme.tableHeaderBg[2]);
  pdf.rect(MARGIN, currentY, halfWidth, 4.5, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(6);
  pdf.setTextColor(theme.slateGray[0], theme.slateGray[1], theme.slateGray[2]);
  pdf.text('EIXO', MARGIN + 2, currentY + 3.2);
  pdf.text('REF.', MARGIN + 26, currentY + 3.2);
  pdf.text('MED. 1', MARGIN + 48, currentY + 3.2);
  pdf.text('MED. 2', MARGIN + 68, currentY + 3.2);

  // Col 2 Box for Engrenamento
  const notesHeight = 21;
  pdf.setFillColor(theme.lightBg[0], theme.lightBg[1], theme.lightBg[2]);
  pdf.rect(col2X, currentY, halfWidth, notesHeight, 'FD');
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(6.5);
  pdf.setTextColor(theme.darkNavy[0], theme.darkNavy[1], theme.darkNavy[2]);
  const engText = pdf.splitTextToSize(`Engrenamento: ${sheet.engrenamentoComentarios || 'Conforme projeto.'}`, halfWidth - 4);
  const carcText = pdf.splitTextToSize(`Carcaça: ${sheet.carcacaComentarios || 'Sem trincas ou deformações.'}`, halfWidth - 4);
  pdf.text(engText, col2X + 2, currentY + 4);
  pdf.text(carcText, col2X + 2, currentY + 12);

  currentY += 4.5;

  // Folgas Axiais Rows
  const folgaRows = [
    { name: 'Eixo A.R.', data: sheet.folgasAxiais.eixoAR },
    { name: 'Eixo Int.', data: sheet.folgasAxiais.eixoInt },
    { name: 'Eixo B.R.', data: sheet.folgasAxiais.eixoBR },
  ];

  folgaRows.forEach((r, idx) => {
    if (idx % 2 === 1) {
      pdf.setFillColor(theme.tableZebraBg[0], theme.tableZebraBg[1], theme.tableZebraBg[2]);
      pdf.rect(MARGIN, currentY, halfWidth, 5.5, 'F');
    }
    pdf.rect(MARGIN, currentY, halfWidth, 5.5, 'S');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(6.8);
    pdf.setTextColor(theme.darkNavy[0], theme.darkNavy[1], theme.darkNavy[2]);
    pdf.text(r.name, MARGIN + 2, currentY + 4);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6.5);
    pdf.text(r.data.ref || '---', MARGIN + 26, currentY + 4);
    pdf.text(r.data.med1 || '---', MARGIN + 48, currentY + 4);
    pdf.text(r.data.med2 || '---', MARGIN + 68, currentY + 4);

    currentY += 5.5;
  });

  currentY += 4;

  // SECTION 5: SERVIÇOS E COMENTÁRIOS ADICIONAIS
  currentY = drawSectionHeader('6. SERVIÇOS E COMENTÁRIOS ADICIONAIS', currentY);
  pdf.setFillColor(theme.lightBg[0], theme.lightBg[1], theme.lightBg[2]);
  pdf.rect(MARGIN, currentY, CONTENT_WIDTH, 14, 'FD');
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  pdf.setTextColor(theme.darkNavy[0], theme.darkNavy[1], theme.darkNavy[2]);
  const addComments = sheet.servicosComentariosAdicionais || 'Todos os ajustes, pré-cargas e tolerâncias dimensionais inspecionados de acordo com as especificações do fabricante e procedimentos internos da Oficina Central Kinross Paracatu.';
  const splitAddComments = pdf.splitTextToSize(addComments, CONTENT_WIDTH - 6);
  pdf.text(splitAddComments, MARGIN + 3, currentY + 4.5);

  drawFooter(pageNum);
  return pageNum;
}

/**
 * Renders PROCEDIMENTO DE REFORMA (REDUTORES / BOMBAS / MANCAIS) in PDF format
 */
export function renderProcedureSheetPDF(
  pdf: jsPDF,
  sheet: ProcedureSheet,
  report: MaintenanceReport,
  drawRunningHeader: (p: number) => void,
  drawFooter: (p: number) => void
): number {
  pdf.addPage();
  let pageNum = pdf.getNumberOfPages();
  drawRunningHeader(pageNum);

  const titleMap = {
    REDUTORES: 'PROCEDIMENTO DE REFORMA - REDUTORES',
    BOMBAS: 'PROCEDIMENTO DE REFORMA - BOMBAS',
    MANCAIS: 'PROCEDIMENTO DE REFORMA - MANCAIS',
  };

  const sheetTitle = titleMap[sheet.tipo] || `PROCEDIMENTO DE REFORMA - ${sheet.tipo}`;
  let currentY = 22;
  currentY = drawSheetBanner(pdf, sheetTitle, currentY, theme.excelGreen);

  // Metadata Grid
  const metaItems = [
    { label: 'OS', value: report.os || '---' },
    { label: 'COMPONENTE', value: sheet.componente || sheet.tipo },
    { label: 'TIPO OS', value: sheet.tipoOs || 'PREVENTIVA' },
    { label: 'TAG', value: report.tag || '---' },
    { label: 'N UNID', value: sheet.nUnid || '---' },
    { label: 'OS PAI', value: sheet.osPai || '---' },
  ];
  currentY = drawMetadataGrid(pdf, metaItems, currentY);

  // Render sections with dynamic page breaking
  for (const section of sheet.sections) {
    // Check if we have enough space for section header + at least 2 items
    if (currentY > 255) {
      drawFooter(pageNum);
      pdf.addPage();
      pageNum = pdf.getNumberOfPages();
      drawRunningHeader(pageNum);
      currentY = 22;
    }

    // Section Header
    pdf.setFillColor(theme.darkNavy[0], theme.darkNavy[1], theme.darkNavy[2]);
    pdf.rect(MARGIN, currentY, CONTENT_WIDTH, 5.5, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.setTextColor(255, 255, 255);
    pdf.text(`${section.sectionNumber} - ${section.sectionName.toUpperCase()}`, MARGIN + 3, currentY + 4);
    currentY += 5.5;

    // Table Column Headers
    pdf.setFillColor(theme.tableHeaderBg[0], theme.tableHeaderBg[1], theme.tableHeaderBg[2]);
    pdf.rect(MARGIN, currentY, CONTENT_WIDTH, 4.5, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(6.5);
    pdf.setTextColor(theme.slateGray[0], theme.slateGray[1], theme.slateGray[2]);
    pdf.text('ITENS DE VERIFICAÇÃO', MARGIN + 2, currentY + 3.2);
    pdf.text('SITUAÇÃO', MARGIN + 115, currentY + 3.2);
    pdf.text('OBSERVAÇÃO', MARGIN + 138, currentY + 3.2);
    currentY += 4.5;

    // Items with dynamic multi-line height calculation
    section.items.forEach((item, idx) => {
      // Split item and observation texts so they never escape their columns
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(6.8);
      const itemLines = pdf.splitTextToSize(item.item, 108);
      const obsLines = pdf.splitTextToSize(item.observacao || '---', CONTENT_WIDTH - 140);
      const maxLines = Math.max(itemLines.length, obsLines.length);
      const rowHeight = Math.max(5.5, maxLines * 3.4 + 2);

      // Page break check
      if (currentY + rowHeight > 280) {
        drawFooter(pageNum);
        pdf.addPage();
        pageNum = pdf.getNumberOfPages();
        drawRunningHeader(pageNum);
        currentY = 22;

        // Re-print column header on new page
        pdf.setFillColor(theme.tableHeaderBg[0], theme.tableHeaderBg[1], theme.tableHeaderBg[2]);
        pdf.rect(MARGIN, currentY, CONTENT_WIDTH, 4.5, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(6.5);
        pdf.setTextColor(theme.slateGray[0], theme.slateGray[1], theme.slateGray[2]);
        pdf.text('ITENS DE VERIFICAÇÃO (CONT.)', MARGIN + 2, currentY + 3.2);
        pdf.text('SITUAÇÃO', MARGIN + 115, currentY + 3.2);
        pdf.text('OBSERVAÇÃO', MARGIN + 138, currentY + 3.2);
        currentY += 4.5;
      }

      // Zebra background
      if (idx % 2 === 1) {
        pdf.setFillColor(theme.tableZebraBg[0], theme.tableZebraBg[1], theme.tableZebraBg[2]);
        pdf.rect(MARGIN, currentY, CONTENT_WIDTH, rowHeight, 'F');
      }
      pdf.setDrawColor(theme.borderGray[0], theme.borderGray[1], theme.borderGray[2]);
      pdf.setLineWidth(0.2);
      pdf.rect(MARGIN, currentY, CONTENT_WIDTH, rowHeight, 'S');

      // Item text
      pdf.setTextColor(theme.darkNavy[0], theme.darkNavy[1], theme.darkNavy[2]);
      pdf.text(itemLines, MARGIN + 2, currentY + 3.8);

      // Situation S / N / NA Badge
      const sit = item.situacao || '';
      if (sit === 'S') {
        pdf.setFillColor(16, 185, 129); // emerald green
        pdf.roundedRect(MARGIN + 117, currentY + 1.2, 8, 3.8, 1, 1, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(6.5);
        pdf.setTextColor(255, 255, 255);
        pdf.text('S', MARGIN + 121, currentY + 3.8, { align: 'center' });
      } else if (sit === 'N') {
        pdf.setFillColor(239, 68, 68); // rose red
        pdf.roundedRect(MARGIN + 117, currentY + 1.2, 8, 3.8, 1, 1, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(6.5);
        pdf.setTextColor(255, 255, 255);
        pdf.text('N', MARGIN + 121, currentY + 3.8, { align: 'center' });
      } else if (sit === 'NA') {
        pdf.setFillColor(100, 116, 139); // slate
        pdf.roundedRect(MARGIN + 116, currentY + 1.2, 10, 3.8, 1, 1, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(6);
        pdf.setTextColor(255, 255, 255);
        pdf.text('NA', MARGIN + 121, currentY + 3.8, { align: 'center' });
      } else {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(6.5);
        pdf.setTextColor(theme.slateGray[0], theme.slateGray[1], theme.slateGray[2]);
        pdf.text('-', MARGIN + 121, currentY + 3.8, { align: 'center' });
      }

      // Observation
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(6.5);
      pdf.setTextColor(theme.darkNavy[0], theme.darkNavy[1], theme.darkNavy[2]);
      pdf.text(obsLines, MARGIN + 138, currentY + 3.8);

      currentY += rowHeight;
    });

    currentY += 2;
  }

  // Technical Conclusion Box at the bottom of the checklist
  if (currentY > 250) {
    drawFooter(pageNum);
    pdf.addPage();
    pageNum = pdf.getNumberOfPages();
    drawRunningHeader(pageNum);
    currentY = 22;
  }

  pdf.setFillColor(theme.darkNavy[0], theme.darkNavy[1], theme.darkNavy[2]);
  pdf.rect(MARGIN, currentY, CONTENT_WIDTH, 5.5, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.5);
  pdf.setTextColor(255, 255, 255);
  pdf.text('CONCLUSÃO DO PROCEDIMENTO DE REFORMA', MARGIN + 3, currentY + 4);
  currentY += 5.5;

  pdf.setFillColor(theme.lightBg[0], theme.lightBg[1], theme.lightBg[2]);
  pdf.rect(MARGIN, currentY, CONTENT_WIDTH, 16, 'FD');
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  pdf.setTextColor(theme.darkNavy[0], theme.darkNavy[1], theme.darkNavy[2]);
  const conclusionMsg = sheet.conclusao || 'Procedimento executado em conformidade com as diretrizes e padrões técnicos exigidos na Oficina Central Kinross Paracatu.';
  const splitConc = pdf.splitTextToSize(conclusionMsg, CONTENT_WIDTH - 6);
  pdf.text(splitConc, MARGIN + 3, currentY + 4.5);

  drawFooter(pageNum);
  return pageNum;
}

/**
 * Renders LISTA P/ PEDIDO DE PEÇAS in PDF format (Exact layout matching physical sheet)
 */
export function renderPartsOrderSheetPDF(
  pdf: jsPDF,
  sheet: PartsOrderSheet,
  report: MaintenanceReport,
  drawRunningHeader: (p: number) => void,
  drawFooter: (p: number) => void
): number {
  pdf.addPage();
  let pageNum = pdf.getNumberOfPages();
  drawRunningHeader(pageNum);

  let currentY = 22;
  currentY = drawSheetBanner(pdf, 'LISTA P/ PEDIDO DE PEÇAS', currentY, theme.kinrossGold);

  // Metadata Grid: 2 rows of 3 columns
  const rowHeight = 7.5;
  const colWidth = CONTENT_WIDTH / 3;

  // Row 1
  const metaRow1 = [
    { label: 'DATA', value: sheet.data || report.startDate || '' },
    { label: 'TAG', value: sheet.tag || report.tag || '' },
    { label: 'EQUIPAMENTO', value: sheet.equipamento || report.title || '' },
  ];
  pdf.setFillColor(theme.lightBg[0], theme.lightBg[1], theme.lightBg[2]);
  pdf.setDrawColor(theme.borderGray[0], theme.borderGray[1], theme.borderGray[2]);
  pdf.setLineWidth(0.3);
  pdf.rect(MARGIN, currentY, CONTENT_WIDTH, rowHeight, 'FD');

  metaRow1.forEach((item, idx) => {
    const colX = MARGIN + idx * colWidth;
    if (idx > 0) pdf.line(colX, currentY, colX, currentY + rowHeight);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(6.5);
    pdf.setTextColor(theme.slateGray[0], theme.slateGray[1], theme.slateGray[2]);
    pdf.text(`${item.label}:`, colX + 2, currentY + 3);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.setTextColor(theme.darkNavy[0], theme.darkNavy[1], theme.darkNavy[2]);
    pdf.text(item.value || '---', colX + 22, currentY + 5.5);
  });
  currentY += rowHeight;

  // Row 2
  const metaRow2 = [
    { label: 'POR', value: sheet.solicitante || report.technician || '' },
    { label: 'OS', value: sheet.os || report.os || '' },
    { label: 'ÁREA', value: sheet.area || 'Oficina Central' },
  ];
  pdf.setFillColor(theme.lightBg[0], theme.lightBg[1], theme.lightBg[2]);
  pdf.rect(MARGIN, currentY, CONTENT_WIDTH, rowHeight, 'FD');

  metaRow2.forEach((item, idx) => {
    const colX = MARGIN + idx * colWidth;
    if (idx > 0) pdf.line(colX, currentY, colX, currentY + rowHeight);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(6.5);
    pdf.setTextColor(theme.slateGray[0], theme.slateGray[1], theme.slateGray[2]);
    pdf.text(`${item.label}:`, colX + 2, currentY + 3);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.setTextColor(theme.darkNavy[0], theme.darkNavy[1], theme.darkNavy[2]);
    pdf.text(item.value || '---', colX + 22, currentY + 5.5);
  });
  currentY += rowHeight + 4;

  // Table Columns Setup (Without Status column)
  const colW_codigo = 38;
  const colW_qtd = 28;
  const colW_desc = CONTENT_WIDTH - (colW_codigo + colW_qtd);

  // Table Header
  pdf.setFillColor(theme.darkNavy[0], theme.darkNavy[1], theme.darkNavy[2]);
  pdf.rect(MARGIN, currentY, CONTENT_WIDTH, 7, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(255, 255, 255);

  let curX = MARGIN;
  pdf.text('CÓDIGO', curX + colW_codigo / 2, currentY + 4.8, { align: 'center' });
  curX += colW_codigo;
  pdf.text('QUANTIDADE', curX + colW_qtd / 2, currentY + 4.8, { align: 'center' });
  curX += colW_qtd;
  pdf.text('DESCRIÇÃO / PART NUMBER', curX + 4, currentY + 4.8);

  currentY += 7;

  // Combine items, ensure at least 16 rows to match the physical sheet layout
  const rows = [...sheet.items];
  while (rows.length < 16) {
    rows.push({
      id: `pad_${rows.length}`,
      codigo: '',
      quantidade: '',
      descricaoPartNumber: '',
    });
  }

  // Draw rows
  const itemRowHeight = 9.5;
  rows.forEach((item, index) => {
    // Pagination safety
    if (currentY + itemRowHeight > PAGE_HEIGHT - 20) {
      drawFooter(pageNum);
      pdf.addPage();
      pageNum = pdf.getNumberOfPages();
      drawRunningHeader(pageNum);
      currentY = 22;

      // Repeat header
      pdf.setFillColor(theme.darkNavy[0], theme.darkNavy[1], theme.darkNavy[2]);
      pdf.rect(MARGIN, currentY, CONTENT_WIDTH, 6, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7);
      pdf.setTextColor(255, 255, 255);
      pdf.text('CÓDIGO', MARGIN + colW_codigo / 2, currentY + 4.2, { align: 'center' });
      pdf.text('QUANTIDADE', MARGIN + colW_codigo + colW_qtd / 2, currentY + 4.2, { align: 'center' });
      pdf.text('DESCRIÇÃO / PART NUMBER', MARGIN + colW_codigo + colW_qtd + 4, currentY + 4.2);
      currentY += 6;
    }

    const isZebra = index % 2 === 1;
    if (isZebra) {
      pdf.setFillColor(theme.tableZebraBg[0], theme.tableZebraBg[1], theme.tableZebraBg[2]);
    } else {
      pdf.setFillColor(255, 255, 255);
    }
    pdf.rect(MARGIN, currentY, CONTENT_WIDTH, itemRowHeight, 'F');

    pdf.setDrawColor(theme.borderGray[0], theme.borderGray[1], theme.borderGray[2]);
    pdf.setLineWidth(0.2);
    pdf.rect(MARGIN, currentY, CONTENT_WIDTH, itemRowHeight, 'D');

    // Column separators
    let sepX = MARGIN + colW_codigo;
    pdf.line(sepX, currentY, sepX, currentY + itemRowHeight);
    sepX += colW_qtd;
    pdf.line(sepX, currentY, sepX, currentY + itemRowHeight);

    // Render values
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.setTextColor(theme.darkNavy[0], theme.darkNavy[1], theme.darkNavy[2]);

    // Código
    if (item.codigo) {
      pdf.text(item.codigo, MARGIN + colW_codigo / 2, currentY + 5.5, { align: 'center' });
    }

    // Quantidade
    if (item.quantidade) {
      pdf.text(item.quantidade, MARGIN + colW_codigo + colW_qtd / 2, currentY + 5.5, { align: 'center' });
    }

    // Descrição / Part Number with text wrapping
    if (item.descricaoPartNumber) {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.setTextColor(theme.darkNavy[0], theme.darkNavy[1], theme.darkNavy[2]);
      const splitDesc = pdf.splitTextToSize(item.descricaoPartNumber, colW_desc - 8);
      pdf.text(splitDesc.slice(0, 2), MARGIN + colW_codigo + colW_qtd + 4, currentY + 4);
    }

    currentY += itemRowHeight;
  });

  drawFooter(pageNum);
  return pageNum;
}

/**
 * Renders MANUTENÇÃO DE MOTORES ELÉTRICOS in PDF format (2 pages matching Kinross institutional standards)
 */
export function renderMotorSheetPDF(
  pdf: jsPDF,
  sheet: ElectricMotorSheet,
  report: MaintenanceReport,
  drawRunningHeader: (p: number) => void,
  drawFooter: (p: number) => void
): number {
  // ================= PAGE 1: TESTES INICIAIS & ELÉTRICOS =================
  pdf.addPage();
  let pageNum = pdf.getNumberOfPages();
  drawRunningHeader(pageNum);

  let currentY = 22;
  currentY = drawSheetBanner(pdf, 'MANUTENÇÃO DE MOTORES ELÉTRICOS', currentY, theme.kinrossGold);

  // Section: TESTES INICIAIS
  pdf.setFillColor(theme.darkNavy[0], theme.darkNavy[1], theme.darkNavy[2]);
  pdf.rect(MARGIN, currentY, CONTENT_WIDTH, 5, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(255, 255, 255);
  pdf.text('TESTES INICIAIS / DADOS DE PLACA', MARGIN + 3, currentY + 3.6);
  currentY += 5;

  // Grid for motor initial data
  const gridRows = [
    [
      { label: 'Data', value: sheet.data || report.startDate || '' },
      { label: 'OS', value: sheet.os || report.os || '' },
      { label: 'TAG', value: sheet.tag || report.tag || '' },
      { label: 'Equipamento', value: sheet.equipamento || report.title || '' },
    ],
    [
      { label: 'Modelo/Carcaça', value: sheet.modeloCarcaca || '' },
      { label: 'Potência (CV)', value: sheet.potenciaCv || '' },
      { label: 'Polos', value: sheet.polos || '' },
      { label: 'Velocidade', value: sheet.velocidadeRpm || '' },
    ],
    [
      { label: 'Tensão', value: sheet.tensaoV || '' },
      { label: 'Corrente', value: sheet.correnteA || '' },
      { label: 'Ip/In', value: sheet.ipIn || '' },
      { label: 'Nº Patrimônio', value: sheet.numPatrimonio || '' },
    ],
    [
      { label: 'Nº Série', value: sheet.numSerie || '' },
      { label: 'Forma Construtiva', value: sheet.formaConstrutiva || '' },
      { label: 'Classe Isolação', value: sheet.classeIsolacao || '' },
      { label: 'Temp / Umidade', value: `${sheet.tempAmbienteC || '--'}°C / ${sheet.umidadeRelativaPercent || '--'}%` },
    ],
  ];

  const gridRowH = 6.5;
  const gridColW = CONTENT_WIDTH / 4;

  gridRows.forEach((row) => {
    pdf.setFillColor(theme.lightBg[0], theme.lightBg[1], theme.lightBg[2]);
    pdf.rect(MARGIN, currentY, CONTENT_WIDTH, gridRowH, 'FD');
    pdf.setDrawColor(theme.borderGray[0], theme.borderGray[1], theme.borderGray[2]);
    pdf.setLineWidth(0.2);

    row.forEach((col, colIdx) => {
      const colX = MARGIN + colIdx * gridColW;
      if (colIdx > 0) pdf.line(colX, currentY, colX, currentY + gridRowH);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(5.8);
      pdf.setTextColor(theme.slateGray[0], theme.slateGray[1], theme.slateGray[2]);
      pdf.text(col.label.toUpperCase(), colX + 1.5, currentY + 2.6);

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(6.8);
      pdf.setTextColor(theme.darkNavy[0], theme.darkNavy[1], theme.darkNavy[2]);
      const shortVal = pdf.splitTextToSize(col.value || '---', gridColW - 3);
      pdf.text(shortVal[0] || '---', colX + 1.5, currentY + 5.2);
    });
    currentY += gridRowH;
  });

  currentY += 3;

  // Section: TESTES ESTÁTICOS (Resistência Ôhmica & DR)
  pdf.setFillColor(theme.darkNavy[0], theme.darkNavy[1], theme.darkNavy[2]);
  pdf.rect(MARGIN, currentY, CONTENT_WIDTH, 5, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(255, 255, 255);
  pdf.text('TESTES ESTÁTICOS - RESISTÊNCIA ÔHMICA & DESEQUILÍBRIO (DR)', MARGIN + 3, currentY + 3.6);
  currentY += 5;

  // Box for Resistance & DR
  const ohmW1 = 70;
  const ohmH = 22;

  pdf.setFillColor(255, 255, 255);
  pdf.rect(MARGIN, currentY, CONTENT_WIDTH, ohmH, 'FD');
  pdf.setDrawColor(theme.borderGray[0], theme.borderGray[1], theme.borderGray[2]);
  pdf.line(MARGIN + ohmW1, currentY, MARGIN + ohmW1, currentY + ohmH);

  // Left: Table R/S, S/T, T/R
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(6.5);
  pdf.setTextColor(theme.slateGray[0], theme.slateGray[1], theme.slateGray[2]);
  pdf.text('Fases', MARGIN + 2, currentY + 4);
  pdf.text('Resistência (Ω)', MARGIN + 20, currentY + 4);
  pdf.text('Condição', MARGIN + 48, currentY + 4);
  pdf.line(MARGIN, currentY + 5.5, MARGIN + ohmW1, currentY + 5.5);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(theme.darkNavy[0], theme.darkNavy[1], theme.darkNavy[2]);
  pdf.text('R/S', MARGIN + 2, currentY + 9.5);
  pdf.text(sheet.resistenciaRS ? `${sheet.resistenciaRS} Ω` : '---', MARGIN + 20, currentY + 9.5);
  pdf.text(sheet.condicaoRS_ST_TR || 'Conforme', MARGIN + 48, currentY + 9.5);

  pdf.text('S/T', MARGIN + 2, currentY + 14.5);
  pdf.text(sheet.resistenciaST ? `${sheet.resistenciaST} Ω` : '---', MARGIN + 20, currentY + 14.5);
  pdf.text('---', MARGIN + 48, currentY + 14.5);

  pdf.text('T/R', MARGIN + 2, currentY + 19.5);
  pdf.text(sheet.resistenciaTR ? `${sheet.resistenciaTR} Ω` : '---', MARGIN + 20, currentY + 19.5);
  pdf.text('---', MARGIN + 48, currentY + 19.5);

  // Right: Formula & DR Value
  const rightX = MARGIN + ohmW1 + 3;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(6.5);
  pdf.setTextColor(theme.darkNavy[0], theme.darkNavy[1], theme.darkNavy[2]);
  pdf.text('FÓRMULA DO DESEQUILÍBRIO:', rightX, currentY + 4);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(6.5);
  pdf.text('DR = [(Resistência-maior - Resistência-menor) / Resistência-menor] × 100', rightX, currentY + 8);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(theme.kinrossGold[0], theme.kinrossGold[1], theme.kinrossGold[2]);
  pdf.text(`PERCENTUAL OBTIDO: ${sheet.desequilibrioPercent ? sheet.desequilibrioPercent + '%' : '---'}`, rightX, currentY + 13.5);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(6.5);
  pdf.setTextColor(theme.darkNavy[0], theme.darkNavy[1], theme.darkNavy[2]);
  pdf.text('LIMITE ADMISSÍVEL: ≤ 3%', rightX, currentY + 17.5);

  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(5.5);
  pdf.setTextColor(theme.slateGray[0], theme.slateGray[1], theme.slateGray[2]);
  pdf.text('* O desequilíbrio de resistência (DR) não deverá ser superior a 3%, conforme equação.', rightX, currentY + 20.5);

  currentY += ohmH + 3;

  // Section: SENSORES (ANTES & DEPOIS)
  pdf.setFillColor(theme.darkNavy[0], theme.darkNavy[1], theme.darkNavy[2]);
  pdf.rect(MARGIN, currentY, CONTENT_WIDTH, 5, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(255, 255, 255);
  pdf.text('SENSORES TÉRMICOS (ANTES E DEPOIS)', MARGIN + 3, currentY + 3.6);
  currentY += 5;

  const sensorColW = CONTENT_WIDTH / 2;
  const sensorH = 18;

  // Antes
  pdf.setFillColor(theme.lightBg[0], theme.lightBg[1], theme.lightBg[2]);
  pdf.rect(MARGIN, currentY, sensorColW, sensorH, 'FD');
  pdf.line(MARGIN + sensorColW, currentY, MARGIN + sensorColW, currentY + sensorH);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(6.5);
  pdf.setTextColor(theme.kinrossGold[0], theme.kinrossGold[1], theme.kinrossGold[2]);
  pdf.text(`SENSORES (ANTES) - Tipo: ${sheet.sensoresAntes.tipo || 'PT-100'}`, MARGIN + 2, currentY + 4);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(6.5);
  pdf.setTextColor(theme.darkNavy[0], theme.darkNavy[1], theme.darkNavy[2]);
  pdf.text(`Estator: ${sheet.sensoresAntes.estatorQtd || '--'} un | Status: ${sheet.sensoresAntes.estatorStatus || '---'}`, MARGIN + 2, currentY + 8);
  pdf.text(`Mancal L.A.: ${sheet.sensoresAntes.mancalLAQtd || '--'} un | Status: ${sheet.sensoresAntes.mancalLAStatus || '---'}`, MARGIN + 2, currentY + 12);
  pdf.text(`Mancal L.O.A.: ${sheet.sensoresAntes.mancalLOAQtd || '--'} un | Status: ${sheet.sensoresAntes.mancalLOAStatus || '---'}`, MARGIN + 2, currentY + 16);

  // Depois
  pdf.setFillColor(theme.lightBg[0], theme.lightBg[1], theme.lightBg[2]);
  pdf.rect(MARGIN + sensorColW, currentY, sensorColW, sensorH, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(6.5);
  pdf.setTextColor(theme.kinrossGold[0], theme.kinrossGold[1], theme.kinrossGold[2]);
  pdf.text(`SENSORES (DEPOIS) - Tipo: ${sheet.sensoresDepois.tipo || 'PT-100'}`, MARGIN + sensorColW + 2, currentY + 4);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(6.5);
  pdf.setTextColor(theme.darkNavy[0], theme.darkNavy[1], theme.darkNavy[2]);
  pdf.text(`Estator: ${sheet.sensoresDepois.estatorQtd || '--'} un | Status: ${sheet.sensoresDepois.estatorStatus || '---'}`, MARGIN + sensorColW + 2, currentY + 8);
  pdf.text(`Mancal L.A.: ${sheet.sensoresDepois.mancalLAQtd || '--'} un | Status: ${sheet.sensoresDepois.mancalLAStatus || '---'}`, MARGIN + sensorColW + 2, currentY + 12);
  pdf.text(`Mancal L.O.A.: ${sheet.sensoresDepois.mancalLOAQtd || '--'} un | Status: ${sheet.sensoresDepois.mancalLOAStatus || '---'}`, MARGIN + sensorColW + 2, currentY + 16);

  currentY += sensorH;
  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(5.5);
  pdf.setTextColor(theme.slateGray[0], theme.slateGray[1], theme.slateGray[2]);
  pdf.text('Como padrão, mínimo 01 sensor para enrolamento, ideal 03, ótimo 06, sendo dois por fase e 02 sensores por mancal;', MARGIN + 2, currentY + 3.2);
  currentY += 5;

  // Section: RESISTÊNCIA DE ISOLAÇÃO (ANTES & DEPOIS) & ÍNDICES
  pdf.setFillColor(theme.darkNavy[0], theme.darkNavy[1], theme.darkNavy[2]);
  pdf.rect(MARGIN, currentY, CONTENT_WIDTH, 5, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(255, 255, 255);
  pdf.text('RESISTÊNCIA DE ISOLAÇÃO E ÍNDICES DIELÉTRICOS (ANTES & DEPOIS)', MARGIN + 3, currentY + 3.6);
  currentY += 5;

  const isoColW = CONTENT_WIDTH / 2;
  const isoH = 30;

  // Box Antes
  pdf.setFillColor(255, 255, 255);
  pdf.rect(MARGIN, currentY, isoColW, isoH, 'FD');
  pdf.line(MARGIN + isoColW, currentY, MARGIN + isoColW, currentY + isoH);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(6.5);
  pdf.setTextColor(theme.darkNavy[0], theme.darkNavy[1], theme.darkNavy[2]);
  pdf.text(`RESISTÊNCIA ISOLAÇÃO (ANTES) - Vcc: ${sheet.isolacaoAntes.tensaoAplicadaVcc || '---'}`, MARGIN + 2, currentY + 4.5);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(6.5);
  pdf.text(`• 30 Seg.: ${sheet.isolacaoAntes.res30s ? sheet.isolacaoAntes.res30s + ' MΩ' : '---'}`, MARGIN + 4, currentY + 9);
  pdf.text(`• 1 Min.:  ${sheet.isolacaoAntes.res1min ? sheet.isolacaoAntes.res1min + ' MΩ' : '---'}`, MARGIN + 4, currentY + 13.5);
  pdf.text(`• 10 Min.: ${sheet.isolacaoAntes.res10min ? sheet.isolacaoAntes.res10min + ' MΩ' : '---'}`, MARGIN + 4, currentY + 18);

  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(theme.kinrossGold[0], theme.kinrossGold[1], theme.kinrossGold[2]);
  pdf.text(`Índice Absorção Dielétrica: ${sheet.isolacaoAntes.indiceAbsorcao || '---'}`, MARGIN + 2, currentY + 23);
  pdf.text(`Índice de Polarização: ${sheet.isolacaoAntes.indicePolarizacao || '---'}`, MARGIN + 2, currentY + 27.5);

  // Box Depois
  pdf.setFillColor(255, 255, 255);
  pdf.rect(MARGIN + isoColW, currentY, isoColW, isoH, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(6.5);
  pdf.setTextColor(theme.darkNavy[0], theme.darkNavy[1], theme.darkNavy[2]);
  pdf.text(`RESISTÊNCIA ISOLAÇÃO (DEPOIS) - Vcc: ${sheet.isolacaoDepois.tensaoAplicadaVcc || '---'}`, MARGIN + isoColW + 2, currentY + 4.5);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(6.5);
  pdf.text(`• 30 Seg.: ${sheet.isolacaoDepois.res30s ? sheet.isolacaoDepois.res30s + ' MΩ' : '---'}`, MARGIN + isoColW + 4, currentY + 9);
  pdf.text(`• 1 Min.:  ${sheet.isolacaoDepois.res1min ? sheet.isolacaoDepois.res1min + ' MΩ' : '---'}`, MARGIN + isoColW + 4, currentY + 13.5);
  pdf.text(`• 10 Min.: ${sheet.isolacaoDepois.res10min ? sheet.isolacaoDepois.res10min + ' MΩ' : '---'}`, MARGIN + isoColW + 4, currentY + 18);

  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(theme.kinrossGold[0], theme.kinrossGold[1], theme.kinrossGold[2]);
  pdf.text(`Índice Absorção Dielétrica: ${sheet.isolacaoDepois.indiceAbsorcao || '---'}`, MARGIN + isoColW + 2, currentY + 23);
  pdf.text(`Índice de Polarização: ${sheet.isolacaoDepois.indicePolarizacao || '---'}`, MARGIN + isoColW + 2, currentY + 27.5);

  currentY += isoH + 2;

  // Criteria Guide (Ruim / Atenção / Bom / Excelente)
  pdf.setFillColor(theme.tableZebraBg[0], theme.tableZebraBg[1], theme.tableZebraBg[2]);
  pdf.rect(MARGIN, currentY, CONTENT_WIDTH, 14, 'FD');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(5.8);
  pdf.setTextColor(theme.slateGray[0], theme.slateGray[1], theme.slateGray[2]);
  pdf.text('REFERÊNCIA ÍNDICE DE POLARIZAÇÃO (I.P):', MARGIN + 2, currentY + 3.5);
  pdf.setFont('helvetica', 'normal');
  pdf.text('I.P < 1,0 - Ruim   |   2,0 > I.P > 1,0 - Atenção   |   4,0 > I.P > 2,0 - Bom   |   I.P > 4,0 - Excelente', MARGIN + 2, currentY + 7);

  pdf.setFont('helvetica', 'bold');
  pdf.text('REFERÊNCIA ÍNDICE ABSORÇÃO DIELÉTRICA (I.A.D):', MARGIN + 2, currentY + 10.5);
  pdf.setFont('helvetica', 'normal');
  pdf.text('I.A.D < 1,1 - Ruim   |   1,25 > I.A.D > 1,1 - Atenção   |   1,60 > I.A.D > 1,25 - Bom   |   I.A.D > 1,60 - Excelente', MARGIN + 2, currentY + 13.5);

  currentY += 16;

  // Section: RESISTÊNCIA DE AQUECIMENTO & BOBINA DE FREIO
  pdf.setFillColor(theme.lightBg[0], theme.lightBg[1], theme.lightBg[2]);
  pdf.rect(MARGIN, currentY, CONTENT_WIDTH, 10, 'FD');
  pdf.line(MARGIN + CONTENT_WIDTH / 2, currentY, MARGIN + CONTENT_WIDTH / 2, currentY + 10);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(6.5);
  pdf.setTextColor(theme.darkNavy[0], theme.darkNavy[1], theme.darkNavy[2]);
  pdf.text('RESISTÊNCIA DE AQUECIMENTO (SE APLICÁVEL):', MARGIN + 2, currentY + 3.8);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Individual: ${sheet.aquecimentoIndividualOhm ? sheet.aquecimentoIndividualOhm + ' Ω' : '---'}   |   Isolação x Massa: ${sheet.aquecimentoIsolacaoMassaMohm ? sheet.aquecimentoIsolacaoMassaMohm + ' MΩ' : '---'}`, MARGIN + 2, currentY + 7.5);

  pdf.setFont('helvetica', 'bold');
  pdf.text('BOBINA DE FREIO (SE APLICÁVEL):', MARGIN + CONTENT_WIDTH / 2 + 2, currentY + 3.8);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Resistência: ${sheet.freioResistenciaOhm ? sheet.freioResistenciaOhm + ' Ω' : '---'}   |   Isolação x Massa: ${sheet.freioIsolacaoMassaMohm ? sheet.freioIsolacaoMassaMohm + ' MΩ' : '---'}`, MARGIN + CONTENT_WIDTH / 2 + 2, currentY + 7.5);

  drawFooter(pageNum);

  // ================= PAGE 2: FOLGAS MECÂNICAS & ATIVIDADE =================
  pdf.addPage();
  pageNum = pdf.getNumberOfPages();
  drawRunningHeader(pageNum);

  currentY = 22;
  currentY = drawSheetBanner(pdf, 'VERIFICAÇÃO DE FOLGA & ATIVIDADE', currentY, theme.kinrossGold);

  // Subheader: TAG, OS, DATA, EXECUTANTES
  const metaP2 = [
    { label: 'TAG', value: sheet.tag || report.tag || '' },
    { label: 'OS', value: sheet.os || report.os || '' },
    { label: 'DATA', value: sheet.data || report.startDate || '' },
    { label: 'EXECUTANTES', value: sheet.executantes || report.technician || '' },
  ];
  currentY = drawMetadataGrid(pdf, metaP2, currentY);

  // DESCRIÇÃO DA ATIVIDADE
  pdf.setFillColor(theme.darkNavy[0], theme.darkNavy[1], theme.darkNavy[2]);
  pdf.rect(MARGIN, currentY, CONTENT_WIDTH, 5, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(255, 255, 255);
  pdf.text('DESCRIÇÃO DA ATIVIDADE', MARGIN + 3, currentY + 3.6);
  currentY += 5;

  pdf.setFillColor(theme.lightBg[0], theme.lightBg[1], theme.lightBg[2]);
  pdf.rect(MARGIN, currentY, CONTENT_WIDTH, 20, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(6.5);
  pdf.setTextColor(theme.darkNavy[0], theme.darkNavy[1], theme.darkNavy[2]);
  pdf.text('1º VERIFICAÇÃO DAS CONDIÇÕES QUE O EQUIPAMENTO CHEGOU NA OFICINA:', MARGIN + 2, currentY + 3.8);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(6.5);
  const condLines = pdf.splitTextToSize(sheet.condicoesChegadaObs || 'Equipamento inspecionado visualmente na recepção.', CONTENT_WIDTH - 6);
  pdf.text(condLines.slice(0, 2), MARGIN + 4, currentY + 7.5);

  pdf.setFont('helvetica', 'bold');
  pdf.text('2º DESMONTAGEM DE COMPONENTES / OBS:', MARGIN + 2, currentY + 13);
  pdf.setFont('helvetica', 'normal');
  const desmLines = pdf.splitTextToSize(sheet.desmontagemComponentesObs || 'Desmontagem realizada conforme procedimentos da oficina mecânica.', CONTENT_WIDTH - 6);
  pdf.text(desmLines.slice(0, 2), MARGIN + 4, currentY + 16.8);

  currentY += 23;

  // VERIFICAÇÃO DE FOLGA - ROLAMENTOS
  pdf.setFillColor(theme.darkNavy[0], theme.darkNavy[1], theme.darkNavy[2]);
  pdf.rect(MARGIN, currentY, CONTENT_WIDTH, 5, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(255, 255, 255);
  pdf.text('VERIFICAÇÃO DE FOLGA: ROLAMENTOS', MARGIN + 3, currentY + 3.6);
  currentY += 5;

  // Rolamentos Table
  const rolH = 14;
  pdf.setFillColor(255, 255, 255);
  pdf.rect(MARGIN, currentY, CONTENT_WIDTH, rolH, 'FD');
  pdf.setDrawColor(theme.borderGray[0], theme.borderGray[1], theme.borderGray[2]);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(6.5);
  pdf.setTextColor(theme.slateGray[0], theme.slateGray[1], theme.slateGray[2]);
  pdf.text('POSIÇÃO', MARGIN + 4, currentY + 4);
  pdf.text('CÓDIGO', MARGIN + 28, currentY + 4);
  pdf.text('NUMERAÇÃO', MARGIN + 68, currentY + 4);
  pdf.text('MEDIDA EXTERNA', MARGIN + 115, currentY + 4);
  pdf.text('MEDIDA INTERNA', MARGIN + 155, currentY + 4);
  pdf.line(MARGIN, currentY + 5.5, MARGIN + CONTENT_WIDTH, currentY + 5.5);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(theme.darkNavy[0], theme.darkNavy[1], theme.darkNavy[2]);
  pdf.text('LA', MARGIN + 4, currentY + 9.5);
  pdf.text(sheet.rolamentos.la.codigo || '---', MARGIN + 28, currentY + 9.5);
  pdf.text(sheet.rolamentos.la.numeracao || '---', MARGIN + 68, currentY + 9.5);
  pdf.text(sheet.rolamentos.la.medidaExterna || '---', MARGIN + 115, currentY + 9.5);
  pdf.text(sheet.rolamentos.la.medidaInterna || '---', MARGIN + 155, currentY + 9.5);

  pdf.text('LOA', MARGIN + 4, currentY + 13);
  pdf.text(sheet.rolamentos.loa.codigo || '---', MARGIN + 28, currentY + 13);
  pdf.text(sheet.rolamentos.loa.numeracao || '---', MARGIN + 68, currentY + 13);
  pdf.text(sheet.rolamentos.loa.medidaExterna || '---', MARGIN + 115, currentY + 13);
  pdf.text(sheet.rolamentos.loa.medidaInterna || '---', MARGIN + 155, currentY + 13);

  currentY += rolH + 4;

  // EIXO & MANCAL (MEDIÇÕES H / V)
  const halfW = (CONTENT_WIDTH - 4) / 2;
  const emH = 26;

  // EIXO
  pdf.setFillColor(theme.darkNavy[0], theme.darkNavy[1], theme.darkNavy[2]);
  pdf.rect(MARGIN, currentY, halfW, 5, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(255, 255, 255);
  pdf.text('EIXO (MEDIÇÕES)', MARGIN + 3, currentY + 3.6);

  pdf.setFillColor(255, 255, 255);
  pdf.rect(MARGIN, currentY + 5, halfW, emH, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(6.5);
  pdf.setTextColor(theme.slateGray[0], theme.slateGray[1], theme.slateGray[2]);
  pdf.text('Ponto', MARGIN + 3, currentY + 9);
  pdf.text('H (Horizontal)', MARGIN + 22, currentY + 9);
  pdf.text('V (Vertical)', MARGIN + 55, currentY + 9);
  pdf.line(MARGIN, currentY + 10.5, MARGIN + halfW, currentY + 10.5);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(theme.darkNavy[0], theme.darkNavy[1], theme.darkNavy[2]);
  pdf.text('LA', MARGIN + 3, currentY + 15);
  pdf.text(sheet.eixo.la.h || '---', MARGIN + 22, currentY + 15);
  pdf.text(sheet.eixo.la.v || '---', MARGIN + 55, currentY + 15);

  pdf.text('LCA', MARGIN + 3, currentY + 20);
  pdf.text(sheet.eixo.lca.h || '---', MARGIN + 22, currentY + 20);
  pdf.text(sheet.eixo.lca.v || '---', MARGIN + 55, currentY + 20);

  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(6);
  pdf.setTextColor(theme.slateGray[0], theme.slateGray[1], theme.slateGray[2]);
  const eixoObs = sheet.eixo.observacoes || 'Sem desvios expressivos.';
  pdf.text(`Obs: ${eixoObs}`, MARGIN + 3, currentY + 28);

  // MANCAL
  const mX = MARGIN + halfW + 4;
  pdf.setFillColor(theme.darkNavy[0], theme.darkNavy[1], theme.darkNavy[2]);
  pdf.rect(mX, currentY, halfW, 5, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(255, 255, 255);
  pdf.text('MANCAL (MEDIÇÕES)', mX + 3, currentY + 3.6);

  pdf.setFillColor(255, 255, 255);
  pdf.rect(mX, currentY + 5, halfW, emH, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(6.5);
  pdf.setTextColor(theme.slateGray[0], theme.slateGray[1], theme.slateGray[2]);
  pdf.text('Ponto', mX + 3, currentY + 9);
  pdf.text('H (Horizontal)', mX + 22, currentY + 9);
  pdf.text('V (Vertical)', mX + 55, currentY + 9);
  pdf.line(mX, currentY + 10.5, mX + halfW, currentY + 10.5);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(theme.darkNavy[0], theme.darkNavy[1], theme.darkNavy[2]);
  pdf.text('LA', mX + 3, currentY + 15);
  pdf.text(sheet.mancal.la.h || '---', mX + 22, currentY + 15);
  pdf.text(sheet.mancal.la.v || '---', mX + 55, currentY + 15);

  pdf.text('LAO', mX + 3, currentY + 20);
  pdf.text(sheet.mancal.lao.h || '---', mX + 22, currentY + 20);
  pdf.text(sheet.mancal.lao.v || '---', mX + 55, currentY + 20);

  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(6);
  pdf.setTextColor(theme.slateGray[0], theme.slateGray[1], theme.slateGray[2]);
  const mancalObs = sheet.mancal.observacoes || 'Alojamentos conformes.';
  pdf.text(`Obs: ${mancalObs}`, mX + 3, currentY + 28);

  currentY += emH + 8;

  // MODIFICAÇÕES / AJUSTES REALIZADOS
  pdf.setFillColor(theme.darkNavy[0], theme.darkNavy[1], theme.darkNavy[2]);
  pdf.rect(MARGIN, currentY, CONTENT_WIDTH, 5, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(255, 255, 255);
  pdf.text('MODIFICAÇÕES / AJUSTES REALIZADOS', MARGIN + 3, currentY + 3.6);
  currentY += 5;

  pdf.setFillColor(theme.lightBg[0], theme.lightBg[1], theme.lightBg[2]);
  pdf.rect(MARGIN, currentY, CONTENT_WIDTH, 18, 'FD');
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(theme.darkNavy[0], theme.darkNavy[1], theme.darkNavy[2]);
  const modObs = sheet.modificacoesAjustesObs || 'Manutenção e ensaios executados em estrita conformidade com os procedimentos e tolerâncias Kinross.';
  const splitMod = pdf.splitTextToSize(modObs, CONTENT_WIDTH - 6);
  pdf.text(splitMod.slice(0, 3), MARGIN + 3, currentY + 5);

  drawFooter(pageNum);
  return pageNum;
}
