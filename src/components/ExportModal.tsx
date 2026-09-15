import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  Mail, 
  Share2, 
  FileText, 
  Check, 
  Copy, 
  ExternalLink, 
  Sparkles, 
  Eye, 
  AlertCircle 
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
  const [shareSuccess, setShareSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      handleGenerate();
    } else {
      if (pdfResult?.blobUrl) {
        URL.revokeObjectURL(pdfResult.blobUrl);
      }
      setPdfResult(null);
      setCopiedSummary(false);
      setShareSuccess(false);
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

  const handleDownloadPDF = () => {
    if (!pdfResult) return;
    const a = document.createElement('a');
    a.href = pdfResult.blobUrl;
    a.download = pdfResult.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const constructEmailBody = () => {
    return `Prezados,

Segue em anexo o Relatório Técnico de Manutenção do equipamento abaixo:

==========================================
DADOS DO RELATÓRIO TÉCNICO:
==========================================
• TAG do Equipamento: ${report.tag || 'N/A'}
• Ordem de Serviço (OS): ${report.os || 'N/A'}
• Data de Início: ${report.startDate || 'N/A'}
• Técnico Responsável: ${report.technician || 'Carlos A. Castro'}
• Status: ${report.status}
• Total de Registros Fotográficos: ${report.photos.length} fotos

COMENTÁRIO GERAL & ESCOPO:
${report.generalComment || 'Desmontagem e inspeção realizada conforme procedimento técnico.'}

------------------------------------------
Documento PDF gerado com fotos em máxima resolução.
Atenciosamente,
${report.technician || 'Carlos A. Castro'}`;
  };

  // Send via Gmail flow (Web Share with attached PDF file on Android, plus Gmail Web compose link)
  const handleSendViaGmail = async () => {
    if (!pdfResult) return;

    const emailSubject = `[Relatório Técnico] TAG: ${report.tag} • OS: ${report.os} - Manutenção de Equipamentos`;
    const emailBody = constructEmailBody();

    // Support multiple recipient emails
    const recipientList = (settings.recipientEmails && settings.recipientEmails.length > 0)
      ? settings.recipientEmails
      : (settings.preconfiguredEmail ? settings.preconfiguredEmail.split(/[,;]/).map(e => e.trim()).filter(Boolean) : ['c.a.castro895@gmail.com']);
    const recipientsString = recipientList.join(', ');

    // 1. First trigger PDF download so the user has the file in their Downloads folder
    handleDownloadPDF();

    // 2. Try Android Web Share API with File (Native Gmail app flow)
    let sharedWithFile = false;
    if (typeof navigator !== 'undefined' && navigator.canShare) {
      try {
        const file = new File([pdfResult.blob], pdfResult.filename, { type: 'application/pdf' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: emailSubject,
            text: emailBody,
            files: [file],
          });
          sharedWithFile = true;
          setShareSuccess(true);
          return;
        }
      } catch (err) {
        console.log('User cancelled or web share not accepted', err);
      }
    }

    // 3. Direct Gmail Web Compose link with all recipient emails
    const gmailWebUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipientsString)}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    
    // Also prepare mailto fallback
    const mailtoUrl = `mailto:${encodeURIComponent(recipientsString)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

    // Open Gmail composer in a new tab
    const newWindow = window.open(gmailWebUrl, '_blank');
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      // If popup blocked, use mailto
      window.location.href = mailtoUrl;
    }
  };

  const copySummaryText = () => {
    navigator.clipboard.writeText(constructEmailBody());
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-neutral-950 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl my-auto flex flex-col text-white">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-black border-b border-neutral-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <FileText className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Relatório Técnico Pronto para Envio
              </h3>
              <p className="text-xs text-zinc-400">
                Layout elegante e organizado com {report.photos.length} fotos em alta resolução.
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
        <div className="p-5 sm:p-6 space-y-6">
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
                  <h4 className="text-sm sm:text-base font-bold text-white">
                    {pdfResult?.filename || 'Relatorio_Tecnico.pdf'}
                  </h4>
                  <p className="text-xs text-zinc-400">
                    Formato A4 • {report.photos.length} páginas de evidências fotográficas com comentários
                  </p>
                </div>

                {/* Pre-configured emails display */}
                <div className="bg-neutral-900 px-3.5 py-2.5 rounded-xl border border-neutral-800 text-left sm:text-right w-full sm:w-auto">
                  <div className="text-[10px] uppercase font-semibold text-zinc-400 flex items-center sm:justify-end gap-1">
                    <Mail className="w-3 h-3 text-amber-500" />
                    Destinatários ({
                      (settings.recipientEmails && settings.recipientEmails.length > 0)
                        ? settings.recipientEmails.length
                        : (settings.preconfiguredEmail ? settings.preconfiguredEmail.split(/[,;]/).filter(Boolean).length : 1)
                    }):
                  </div>
                  <div className="text-xs font-bold text-amber-300 truncate max-w-[260px] font-mono mt-0.5">
                    {(settings.recipientEmails && settings.recipientEmails.length > 0)
                      ? settings.recipientEmails.join(', ')
                      : (settings.preconfiguredEmail || 'c.a.castro895@gmail.com')}
                  </div>
                  <button
                    onClick={onOpenSettings}
                    className="text-[10px] text-zinc-400 hover:text-amber-400 underline transition mt-1 block sm:inline"
                  >
                    Gerenciar destinatários
                  </button>
                </div>
              </div>

              {/* Main Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Send via Gmail Button (Primary) */}
                <button
                  id="btn-send-gmail"
                  onClick={handleSendViaGmail}
                  className="py-3.5 px-4 rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-xl shadow-red-600/20 active:scale-95 transition flex items-center justify-center gap-2.5 group"
                >
                  <Mail className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Enviar via Gmail</span>
                </button>

                {/* Download PDF Button */}
                <button
                  id="btn-download-pdf"
                  onClick={handleDownloadPDF}
                  className="py-3.5 px-4 rounded-2xl bg-amber-600 hover:bg-amber-500 active:scale-95 text-white font-bold text-sm shadow-xl shadow-amber-600/20 transition flex items-center justify-center gap-2.5"
                >
                  <Download className="w-5 h-5" />
                  <span>Baixar Arquivo PDF</span>
                </button>
              </div>

              {/* PDF Preview Frame / Inspection */}
              {pdfResult && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      Visualização Prévia do Relatório:
                    </span>
                    <a
                      href={pdfResult.blobUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
                    >
                      <span>Abrir em tela cheia</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="h-64 sm:h-80 w-full rounded-2xl overflow-hidden border border-neutral-800 bg-black">
                    <iframe
                      src={`${pdfResult.blobUrl}#toolbar=0&view=FitH`}
                      title="Pré-visualização do Relatório"
                      className="w-full h-full border-0"
                    />
                  </div>
                </div>
              )}

              {/* Auxiliary Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-neutral-800 text-xs">
                <button
                  onClick={copySummaryText}
                  className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-zinc-200 transition"
                >
                  {copiedSummary ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Resumo copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar resumo do e-mail</span>
                    </>
                  )}
                </button>

                <span className="text-[11px] text-zinc-500">
                  Compatível com Celular e Tablet Android
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
