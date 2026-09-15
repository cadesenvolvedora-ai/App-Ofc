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
  Send
} from 'lucide-react';
import { MaintenanceReport, AppSettings } from '../types';
import { generateMaintenancePDF, PDFGenerationResult } from '../utils/pdfGenerator';

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
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfResult, setPdfResult] = useState<PDFGenerationResult | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'downloading' | 'success'>('idle');
  const [emailSentNotice, setEmailSentNotice] = useState(false);

  useEffect(() => {
    if (isOpen) {
      handleGenerate();
    } else {
      if (pdfResult?.blobUrl) {
        URL.revokeObjectURL(pdfResult.blobUrl);
      }
      setPdfResult(null);
      setCopiedSummary(false);
      setDownloadStatus('idle');
      setEmailSentNotice(false);
    }
  }, [isOpen]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await generateMaintenancePDF(report, settings);
      setPdfResult(result);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setIsGenerating(false);
    }
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

  const constructEmailBody = () => {
    return `Prezados,

Segue o Relatório Técnico de Manutenção do equipamento abaixo:

==================================================
RELATÓRIO TÉCNICO DE MANUTENÇÃO - KINROSS
==================================================
• TAG do Equipamento: ${report.tag || 'N/A'}
• Ordem de Serviço (OS): ${report.os || 'N/A'}
• Equipamento / Título: ${report.title || 'Manutenção Geral'}
• Data de Início: ${report.startDate || 'N/A'}
• Data de Término: ${report.endDate || 'N/A'}
• Setor / Local: ${report.location || 'Oficina de Manutenção'}
• Técnico Responsável: ${report.technician || settings.technicianDefaultName || 'Carlos A. Castro'}
• Status: ${report.status}
• Total de Registros Fotográficos: ${report.photos.length} fotos registradas

--------------------------------------------------
COMENTÁRIO GERAL & DIAGNÓSTICO:
--------------------------------------------------
${report.generalComment || 'Desmontagem, limpeza, inspeção dimensional e serviços concluídos conforme procedimento técnico.'}

--------------------------------------------------
Arquivo gerado: ${pdfResult?.filename || 'Relatorio_Tecnico.pdf'}
O laudo completo em alta resolução foi gerado e salvo.

Atenciosamente,
${report.technician || settings.technicianDefaultName || 'Carlos A. Castro'}`;
  };

  // Send via Gmail flow: opens Gmail app on tablet with pre-filled structure
  const handleSendViaGmail = async () => {
    if (!pdfResult) return;

    const emailSubject = `[Relatório Técnico Kinross] TAG: ${report.tag || 'N/A'} • OS: ${report.os || 'N/A'} - Manutenção de Equipamentos`;
    const emailBody = constructEmailBody();

    // Default fixed recipient is paulo.sousa@kinross.com
    const recipientList = (settings.recipientEmails && settings.recipientEmails.length > 0)
      ? settings.recipientEmails
      : (settings.preconfiguredEmail ? settings.preconfiguredEmail.split(/[,;]/).map(e => e.trim()).filter(Boolean) : ['paulo.sousa@kinross.com']);
    const recipientsString = recipientList.join(', ');

    // 1. Save/download the PDF to device storage
    handleDownloadPDF();

    // 2. If running inside Android APK native interface, open native Gmail app directly
    if (typeof window !== 'undefined' && (window as any).Android?.openGmail) {
      (window as any).Android.openGmail(recipientsString, emailSubject, emailBody);
      setEmailSentNotice(true);
      setTimeout(() => setEmailSentNotice(false), 4000);
      return;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-neutral-950 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl my-auto flex flex-col text-white">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-black border-b border-neutral-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <FileText className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Relatório Técnico Pronto
              </h3>
              <p className="text-xs text-zinc-400">
                Documento técnico formatado com {report.photos.length} fotos em alta definição.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {isGenerating ? (
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
              <h4 className="text-sm font-bold text-white">
                Renderizando PDF Profissional...
              </h4>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm">
                Organizando cabeçalhos, metadados, molduras de alta resolução e comentários técnicos.
              </p>
            </div>
          ) : (
            <>
              {/* Document Overview Card */}
              <div className="bg-black rounded-2xl border border-neutral-800 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-amber-400">
                      TAG: {report.tag || 'N/A'}
                    </span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-xs font-mono font-bold text-zinc-300">
                      OS: {report.os || 'N/A'}
                    </span>
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-white truncate max-w-md">
                    {pdfResult?.filename || 'Relatorio_Tecnico.pdf'}
                  </h4>
                  <p className="text-xs text-zinc-400">
                    Formato A4 • {report.photos.length} {report.photos.length === 1 ? 'foto registrada' : 'fotos registradas'} com comentários
                  </p>
                </div>

                {/* Destination email display */}
                <div className="bg-neutral-900 px-3.5 py-2.5 rounded-xl border border-neutral-800 text-left sm:text-right w-full sm:w-auto">
                  <div className="text-[10px] uppercase font-semibold text-zinc-400 flex items-center sm:justify-end gap-1">
                    <Mail className="w-3 h-3 text-amber-500" />
                    Destinatário Oficial:
                  </div>
                  <div className="text-xs font-bold text-amber-300 truncate max-w-[240px] font-mono mt-0.5">
                    {(settings.recipientEmails && settings.recipientEmails.length > 0)
                      ? settings.recipientEmails.join(', ')
                      : (settings.preconfiguredEmail || 'paulo.sousa@kinross.com')}
                  </div>
                  <button
                    onClick={onOpenSettings}
                    className="text-[10px] text-zinc-400 hover:text-amber-400 underline transition mt-1 block sm:inline"
                  >
                    Alterar destinatário
                  </button>
                </div>
              </div>

              {/* Status Notice when email is opened */}
              {emailSentNotice && (
                <div className="p-3.5 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2.5 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>O aplicativo Gmail foi aberto com o destinatário e o texto completo do laudo preenchidos!</span>
                </div>
              )}

              {/* Main Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {/* Send via Gmail Button (Primary) */}
                <button
                  type="button"
                  id="btn-send-gmail"
                  onClick={handleSendViaGmail}
                  className="py-4 px-4 rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-95 text-white font-bold text-sm shadow-xl shadow-red-600/25 transition flex items-center justify-center gap-2.5 group cursor-pointer"
                >
                  <Mail className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Enviar Laudo via Gmail</span>
                </button>

                {/* Download PDF Button */}
                <button
                  type="button"
                  id="btn-download-pdf"
                  onClick={handleDownloadPDF}
                  disabled={downloadStatus === 'downloading'}
                  className={`py-4 px-4 rounded-2xl font-bold text-sm shadow-xl active:scale-95 transition flex items-center justify-center gap-2.5 cursor-pointer ${
                    downloadStatus === 'success'
                      ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                      : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20'
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
                      <span>Baixar Arquivo PDF</span>
                    </>
                  )}
                </button>
              </div>

              {/* Auxiliary Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-neutral-800 text-xs">
                <button
                  type="button"
                  onClick={copySummaryText}
                  className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-zinc-200 transition py-1"
                >
                  {copiedSummary ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-semibold">Resumo copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar resumo do e-mail</span>
                    </>
                  )}
                </button>

                <span className="text-[11px] text-zinc-500 font-medium">
                  Tablet & Celular Android
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
