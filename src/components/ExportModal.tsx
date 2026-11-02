import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  Mail, 
  FileText, 
  Check, 
  Copy, 
  Loader2,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ShieldCheck,
  Layers,
  Send
} from 'lucide-react';
import { MaintenanceReport, AppSettings } from '../types';
import { 
  generateMaintenancePDF, 
  PDFGenerationResult, 
  PDFReportPart 
} from '../utils/pdfGenerator';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: MaintenanceReport;
  settings: AppSettings;
  onOpenSettings: () => void;
}

// Convert Blob to Base64 data string
const blobToBase64 = (blob: Blob): Promise<string> => {
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

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  report,
  settings,
  onOpenSettings,
}) => {
  const [selectedPart, setSelectedPart] = useState<PDFReportPart>('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfResult, setPdfResult] = useState<PDFGenerationResult | null>(null);
  const [resultsCache, setResultsCache] = useState<Partial<Record<PDFReportPart, PDFGenerationResult>>>({});
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'downloading' | 'success'>('idle');
  const [emailSentNotice, setEmailSentNotice] = useState(false);

  const totalPhotos = report.photos.length;
  const splitIdx = Math.max(1, Math.ceil(totalPhotos / 2));

  // Reset or initialize modal
  useEffect(() => {
    if (isOpen) {
      setSelectedPart('all');
      setResultsCache({});
      generateForPart('all');
    } else {
      // Cleanup object URLs
      (Object.values(resultsCache) as Array<PDFGenerationResult | undefined>).forEach((res) => {
        if (res?.blobUrl) {
          URL.revokeObjectURL(res.blobUrl);
        }
      });
      if (pdfResult?.blobUrl) {
        URL.revokeObjectURL(pdfResult.blobUrl);
      }
      setPdfResult(null);
      setResultsCache({});
      setCopiedSummary(false);
      setDownloadStatus('idle');
      setEmailSentNotice(false);
    }
  }, [isOpen]);

  const generateForPart = async (part: PDFReportPart) => {
    // Check if in cache
    if (resultsCache[part]) {
      setPdfResult(resultsCache[part]!);
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateMaintenancePDF(report, settings, { part });
      setPdfResult(result);
      setResultsCache((prev) => ({ ...prev, [part]: result }));
    } catch (err) {
      console.error('Error generating PDF for part:', part, err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectPart = (part: PDFReportPart) => {
    if (part === selectedPart && pdfResult) return;
    setSelectedPart(part);
    generateForPart(part);
  };

  // Robust PDF Download handler that works reliably in Android WebView, Chrome, and desktop
  const handleDownloadPDF = async () => {
    if (!pdfResult) return;
    setDownloadStatus('downloading');

    try {
      // 1. If running inside Android APK with native download bridge
      if (typeof window !== 'undefined' && (window as any).Android?.savePdf) {
        const base64 = await blobToBase64(pdfResult.blob);
        (window as any).Android.savePdf(base64, pdfResult.filename);
        setDownloadStatus('success');
        setTimeout(() => setDownloadStatus('idle'), 3500);
        return;
      }

      // 2. Primary Web Download using standard Blob link
      const a = document.createElement('a');
      a.href = pdfResult.blobUrl;
      a.download = pdfResult.filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (document.body.contains(a)) {
          document.body.removeChild(a);
        }
      }, 300);

      // 3. Fallback Data URI for Android WebViews that do not trigger blob downloads
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string' && reader.result.startsWith('data:')) {
          const fallbackLink = document.createElement('a');
          fallbackLink.href = reader.result;
          fallbackLink.download = pdfResult.filename;
          fallbackLink.style.display = 'none';
          document.body.appendChild(fallbackLink);
          fallbackLink.click();
          setTimeout(() => {
            if (document.body.contains(fallbackLink)) {
              document.body.removeChild(fallbackLink);
            }
          }, 300);
        }
      };
      reader.readAsDataURL(pdfResult.blob);

      setDownloadStatus('success');
      setTimeout(() => setDownloadStatus('idle'), 3500);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      setDownloadStatus('idle');
    }
  };

  const getPartLabel = (part: PDFReportPart) => {
    if (part === 'part1') return 'PARTE 1 DE 2 (Fotos Iniciais)';
    if (part === 'part2') return 'PARTE 2 DE 2 (Fotos Finais + Planilhas Técnicas)';
    return 'VOLUME COMPLETO (Laudo Integral)';
  };

  const constructEmailBody = () => {
    const partInfo = getPartLabel(selectedPart);

    return `Prezados,

Segue o Relatório Técnico de Manutenção do equipamento abaixo (${partInfo}):

==================================================
RELATÓRIO TÉCNICO DE MANUTENÇÃO - KINROSS
==================================================
• TAG do Equipamento: ${report.tag || 'N/A'}
• Ordem de Serviço (OS): ${report.os || 'N/A'}
• Equipamento / Título: ${report.title || 'Manutenção Geral'}
• Volume / Divisão: ${partInfo}
• Data de Início: ${report.startDate || 'N/A'}
• Data de Término: ${report.endDate || 'N/A'}
• Setor / Local: ${report.location || 'Oficina de Manutenção'}
• Técnico Responsável: ${report.technician || settings.technicianDefaultName || 'Carlos A. Castro'}
• Status: ${report.status}
• Total de Registros no Arquivo: ${pdfResult ? pdfResult.photosCount : report.photos.length} fotos incluídas (de ${totalPhotos} fotos totais)
• Tamanho do Anexo PDF: ${pdfResult?.sizeFormatted || 'Otimizado'} (Conforme política corporativa < 15 MB)

--------------------------------------------------
COMENTÁRIO GERAL & DIAGNÓSTICO:
--------------------------------------------------
${report.generalComment || 'Desmontagem, limpeza, inspeção dimensional e serviços concluídos conforme procedimento técnico.'}

--------------------------------------------------
ARQUIVO ANEXADO:
${pdfResult?.filename || 'Relatorio_Tecnico.pdf'}
${selectedPart === 'part1' ? 'OBS: As fotos complementares e as folhas técnicas detalhadas estão sendo encaminhadas na PARTE 2.' : ''}
${selectedPart === 'part2' ? 'OBS: Contém os registros complementares, folhas de ajustes, procedimentos e ordens de peças.' : ''}

Atenciosamente,
${report.technician || settings.technicianDefaultName || 'Carlos A. Castro'}`;
  };

  // Send via Gmail flow: opens Gmail app on tablet with pre-filled structure
  const handleSendViaGmail = async () => {
    if (!pdfResult) return;

    let partPrefix = '';
    if (selectedPart === 'part1') partPrefix = '[PARTE 1/2] ';
    if (selectedPart === 'part2') partPrefix = '[PARTE 2/2] ';

    const emailSubject = `${partPrefix}[Relatório Técnico Kinross] TAG: ${report.tag || 'N/A'} • OS: ${report.os || 'N/A'} - Manutenção de Equipamentos`;
    const emailBody = constructEmailBody();

    // Default fixed recipient is paulo.sousa@kinross.com
    const recipientList = (settings.recipientEmails && settings.recipientEmails.length > 0)
      ? settings.recipientEmails
      : (settings.preconfiguredEmail ? settings.preconfiguredEmail.split(/[,;]/).map(e => e.trim()).filter(Boolean) : ['paulo.sousa@kinross.com']);
    const recipientsString = recipientList.join(', ');

    // 1. Save/download the PDF to device storage
    handleDownloadPDF();

    // 2. If running inside Android APK native interface, open native Gmail app directly with ATTACHED PDF!
    if (typeof window !== 'undefined' && (window as any).Android) {
      try {
        const base64 = await blobToBase64(pdfResult.blob);
        if ((window as any).Android.sendEmailWithPdf) {
          (window as any).Android.sendEmailWithPdf(
            recipientsString,
            emailSubject,
            emailBody,
            base64,
            pdfResult.filename
          );
          setEmailSentNotice(true);
          setTimeout(() => setEmailSentNotice(false), 4000);
          return;
        } else if ((window as any).Android.openGmail) {
          (window as any).Android.openGmail(recipientsString, emailSubject, emailBody);
          setEmailSentNotice(true);
          setTimeout(() => setEmailSentNotice(false), 4000);
          return;
        }
      } catch (err) {
        console.warn('Bridge email error, falling back:', err);
      }
    }

    // 3. Try Web Share API with attached PDF file on Android (Native Share -> Gmail)
    if (typeof navigator !== 'undefined' && navigator.canShare) {
      try {
        const file = new File([pdfResult.blob], pdfResult.filename, { type: 'application/pdf' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: emailSubject,
            text: emailBody,
            files: [file],
          });
          setEmailSentNotice(true);
          setTimeout(() => setEmailSentNotice(false), 4000);
          return;
        }
      } catch (err) {
        console.log('Native share skipped or cancelled', err);
      }
    }

    // 4. Direct mailto Intent (triggers native Gmail app on Android Tablet)
    const mailtoUrl = `mailto:${encodeURIComponent(recipientsString)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoUrl;
    setEmailSentNotice(true);
    setTimeout(() => setEmailSentNotice(false), 4000);
  };

  const copySummaryText = () => {
    navigator.clipboard.writeText(constructEmailBody());
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl my-auto flex flex-col text-slate-900">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-800 border border-amber-300">
              <FileText className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Exportação do Relatório Técnico
              </h3>
              <p className="text-xs text-slate-600">
                Otimizado para o limite de e-mail corporativo (<span className="font-semibold text-slate-800">máx. 15 MB</span>).
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 bg-white">
          {/* Part Selection Tabs (Volume Completo vs 2 Partes) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-600" />
                Selecione o modo de envio por e-mail:
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Total de fotos: {totalPhotos}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
              {/* Option 1: Volume Completo */}
              <button
                type="button"
                onClick={() => handleSelectPart('all')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-0.5 cursor-pointer text-center ${
                  selectedPart === 'all'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-300'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <span>Volume Completo</span>
                <span className="text-[10px] font-normal text-slate-500">
                  {totalPhotos} fotos + tabelas
                </span>
              </button>

              {/* Option 2: Parte 1 de 2 */}
              <button
                type="button"
                onClick={() => handleSelectPart('part1')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-0.5 cursor-pointer text-center ${
                  selectedPart === 'part1'
                    ? 'bg-white text-amber-900 shadow-sm border border-amber-400'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <span className="flex items-center gap-1">
                  Parte 1 de 2
                </span>
                <span className="text-[10px] font-normal text-slate-500">
                  Fotos 01 a {splitIdx}
                </span>
              </button>

              {/* Option 3: Parte 2 de 2 */}
              <button
                type="button"
                onClick={() => handleSelectPart('part2')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-0.5 cursor-pointer text-center ${
                  selectedPart === 'part2'
                    ? 'bg-white text-amber-900 shadow-sm border border-amber-400'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <span className="flex items-center gap-1">
                  Parte 2 de 2
                </span>
                <span className="text-[10px] font-normal text-slate-500">
                  {totalPhotos > splitIdx ? `Fotos ${splitIdx + 1} a ${totalPhotos}` : 'Folhas técnicas'}
                </span>
              </button>
            </div>
          </div>

          {isGenerating ? (
            <div className="py-14 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
              <h4 className="text-sm font-bold text-slate-900">
                Comprimindo e Renderizando PDF Profissional...
              </h4>
              <p className="text-xs text-slate-600 mt-1 max-w-sm">
                Processando compressão HD para conformidade com o limite de 15 MB do e-mail corporativo.
              </p>
            </div>
          ) : (
            <>
              {/* Corporate Email Compliance Banner */}
              {pdfResult && (
                <div className={`p-3 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
                  pdfResult.sizeMB < 12
                    ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                    : pdfResult.sizeMB < 15
                    ? 'bg-amber-50/80 border-amber-300 text-amber-950'
                    : 'bg-rose-50/80 border-rose-300 text-rose-950'
                }`}>
                  <div className="flex items-center gap-2.5">
                    {pdfResult.sizeMB < 12 ? (
                      <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                    ) : pdfResult.sizeMB < 15 ? (
                      <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
                        <AlertCircle className="w-4 h-4" />
                      </div>
                    )}
                    <div>
                      <div className="font-bold flex items-center gap-1.5">
                        <span>Tamanho do PDF: {pdfResult.sizeFormatted}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 bg-white/70 rounded border border-current">
                          {pdfResult.sizeMB < 15 ? '✓ Abaixo de 15 MB' : '⚠️ Acima de 15 MB'}
                        </span>
                      </div>
                      <p className="text-[11px] opacity-85 mt-0.5">
                        {pdfResult.sizeMB < 12
                          ? 'Aprovado para envio direto via e-mail corporativo sem risco de bloqueio.'
                          : pdfResult.sizeMB < 15
                          ? 'Próximo do limite de 15 MB. O envio em 2 partes garante 100% de entrega.'
                          : 'Excede 15 MB na rede corporativa. Alterne para a Parte 1 e depois a Parte 2.'}
                      </p>
                    </div>
                  </div>

                  {pdfResult.sizeMB >= 12 && selectedPart === 'all' && (
                    <button
                      type="button"
                      onClick={() => handleSelectPart('part1')}
                      className="shrink-0 px-2.5 py-1 rounded-xl bg-white border border-amber-300 text-amber-900 font-bold text-[11px] hover:bg-amber-50 transition cursor-pointer"
                    >
                      Usar 2 partes
                    </button>
                  )}
                </div>
              )}

              {/* Document Overview Card */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                      TAG: {report.tag || 'N/A'}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-xs font-mono font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded">
                      OS: {report.os || 'N/A'}
                    </span>
                    {selectedPart !== 'all' && (
                      <span className="text-[10px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded uppercase">
                        {selectedPart === 'part1' ? 'Parte 1/2' : 'Parte 2/2'}
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-md font-mono">
                    {pdfResult?.filename || 'Relatorio_Tecnico.pdf'}
                  </h4>
                  <p className="text-xs text-slate-600">
                    Formato A4 • {pdfResult?.photosCount || 0} fotos nesta parte ({pdfResult?.totalPages || 1} páginas totais)
                  </p>
                </div>

                {/* Destination email display */}
                <div className="bg-white px-3 py-2 rounded-xl border border-slate-200 text-left sm:text-right w-full sm:w-auto shadow-xs">
                  <div className="text-[10px] uppercase font-semibold text-slate-600 flex items-center sm:justify-end gap-1">
                    <Mail className="w-3 h-3 text-amber-600" />
                    Destinatário Oficial:
                  </div>
                  <div className="text-xs font-bold text-amber-900 truncate max-w-[240px] font-mono mt-0.5">
                    {(settings.recipientEmails && settings.recipientEmails.length > 0)
                      ? settings.recipientEmails.join(', ')
                      : (settings.preconfiguredEmail || 'paulo.sousa@kinross.com')}
                  </div>
                  <button
                    onClick={onOpenSettings}
                    className="text-[10px] text-slate-600 hover:text-amber-700 font-medium underline transition mt-0.5 block sm:inline cursor-pointer"
                  >
                    Alterar destinatário
                  </button>
                </div>
              </div>

              {/* Status Notice when email is opened */}
              {emailSentNotice && (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2.5 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Aplicativo Gmail preparado com {selectedPart === 'all' ? 'o Volume Completo' : selectedPart === 'part1' ? 'a Parte 1 de 2' : 'a Parte 2 de 2'}!
                  </span>
                </div>
              )}

              {/* Main Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Send via Gmail Button (Primary) */}
                <button
                  type="button"
                  id="btn-send-gmail"
                  onClick={handleSendViaGmail}
                  className="py-3.5 px-4 rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-95 text-white font-bold text-sm shadow-lg shadow-red-500/25 transition flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <Mail className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>
                    {selectedPart === 'part1' ? 'Enviar Parte 1 via Gmail' : selectedPart === 'part2' ? 'Enviar Parte 2 via Gmail' : 'Enviar Laudo via Gmail'}
                  </span>
                </button>

                {/* Download PDF Button */}
                <button
                  type="button"
                  id="btn-download-pdf"
                  onClick={handleDownloadPDF}
                  disabled={downloadStatus === 'downloading'}
                  className={`py-3.5 px-4 rounded-2xl font-bold text-sm shadow-lg active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer ${
                    downloadStatus === 'success'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                      : 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20'
                  }`}
                >
                  {downloadStatus === 'downloading' ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Baixando Arquivo...</span>
                    </>
                  ) : downloadStatus === 'success' ? (
                    <>
                      <Check className="w-5 h-5 text-white" />
                      <span>PDF Baixado com Sucesso!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      <span>
                        {selectedPart === 'part1' ? 'Baixar PDF Parte 1' : selectedPart === 'part2' ? 'Baixar PDF Parte 2' : 'Baixar Arquivo PDF'}
                      </span>
                    </>
                  )}
                </button>
              </div>

              {/* Informative corporate guidance for 2-parts sending */}
              {totalPhotos > 10 && (
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span>
                    <strong>Dica Corporativa:</strong> Se o relatório tiver mais de 15 fotos ou o e-mail for rejeitado pelo servidor da empresa, envie primeiro a <strong>Parte 1</strong> e depois a <strong>Parte 2</strong>. Ambas mantêm numeração e fotos contínuas em alta resolução.
                  </span>
                </div>
              )}

              {/* Auxiliary Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={copySummaryText}
                  className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 transition py-1 font-medium cursor-pointer"
                >
                  {copiedSummary ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-semibold">Resumo copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar resumo do e-mail</span>
                    </>
                  )}
                </button>

                <span className="text-[11px] text-slate-500 font-semibold">
                  Tablet & Celular Android • Limite &lt; 15 MB
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
