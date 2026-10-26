import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  RotateCcw, 
  ClipboardList, 
  Box, 
  Layers,
  Mail,
  Copy,
  Check,
  Send,
  Loader2,
  AtSign,
  FileText,
  AlertCircle
} from 'lucide-react';
import { PartsOrderSheet, PartsOrderItem, AppSettings } from '../types';
import { generatePartsOrderPDF, blobToBase64 } from '../utils/pdfGenerator';
import { loadFixedPartsOrderEmails, saveFixedPartsOrderEmails } from '../utils/storage';

interface PartsOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  sheet: PartsOrderSheet;
  onSave: (sheet: PartsOrderSheet) => void;
  reportTag: string;
  reportOs: string;
  reportEquipment?: string;
  reportTechnician?: string;
  fixedEmail?: string;
  appSettings?: AppSettings;
  onUpdateAppSettings?: (settings: AppSettings) => void;
}

export const PartsOrderModal: React.FC<PartsOrderModalProps> = ({
  isOpen,
  onClose,
  sheet,
  onSave,
  reportTag,
  reportOs,
  reportEquipment = '',
  reportTechnician = '',
  fixedEmail = 'paulo.sousa@kinross.com',
  appSettings,
  onUpdateAppSettings,
}) => {
  // Load globally fixed recipient emails so they are permanent across all tabs and future sessions
  const [fixedEmails, setFixedEmails] = useState<string[]>(() => {
    const loaded = loadFixedPartsOrderEmails();
    if (loaded && loaded.length > 0) return loaded;
    if (appSettings?.recipientEmails && appSettings.recipientEmails.length > 0) {
      return appSettings.recipientEmails;
    }
    return [fixedEmail || 'paulo.sousa@kinross.com'];
  });

  const currentRecipients = fixedEmails.length > 0
    ? fixedEmails
    : [fixedEmail || 'paulo.sousa@kinross.com'];

  const [formData, setFormData] = useState<PartsOrderSheet>(() => {
    return {
      ...sheet,
      tag: sheet.tag || reportTag || '',
      os: sheet.os || reportOs || '',
      data: sheet.data || new Date().toISOString().split('T')[0],
      recipientEmails: currentRecipients,
    };
  });

  const [emailStatus, setEmailStatus] = useState<'idle' | 'copied' | 'opened'>('idle');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [newEmailInput, setNewEmailInput] = useState('');
  const [emailError, setEmailError] = useState('');

  if (!isOpen) return null;

  const handleUpdateItem = (id: string, field: keyof PartsOrderItem, value: string) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((it) => (it.id === id ? { ...it, [field]: value } : it)),
    }));
  };

  const handleAddItem = () => {
    const newItem: PartsOrderItem = {
      id: `part_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      codigo: '',
      quantidade: '',
      descricaoPartNumber: '',
    };
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const handleRemoveItem = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((it) => it.id !== id),
    }));
  };

  const handleClearAll = () => {
    if (window.confirm('Deseja realmente limpar todos os itens da lista de peças?')) {
      setFormData((prev) => ({
        ...prev,
        items: Array.from({ length: 8 }, (_, i) => ({
          id: `part_${Date.now()}_${i}`,
          codigo: '',
          quantidade: '',
          descricaoPartNumber: '',
        })),
      }));
    }
  };

  const handleAddRecipientEmail = (emailToAdd?: string) => {
    const raw = (emailToAdd !== undefined ? emailToAdd : newEmailInput).trim();
    if (!raw) return;

    // Support comma or space separated emails
    const candidates = raw
      .split(/[,;\s]+/)
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    // Standard email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidList = candidates.filter((c) => !emailRegex.test(c));
    if (invalidList.length > 0) {
      setEmailError(`Formato de e-mail inválido: ${invalidList.join(', ')}`);
      return;
    }

    const updated = [...currentRecipients];
    let addedCount = 0;
    candidates.forEach((email) => {
      if (!updated.includes(email)) {
        updated.push(email);
        addedCount++;
      }
    });

    if (addedCount === 0) {
      setEmailError('Este e-mail já está adicionado na lista fixa.');
      return;
    }

    // Persist permanently in app storage (IndexedDB + localStorage)
    setFixedEmails(updated);
    saveFixedPartsOrderEmails(updated);

    setFormData((prev) => ({
      ...prev,
      recipientEmails: updated,
    }));

    if (onUpdateAppSettings && appSettings) {
      onUpdateAppSettings({
        ...appSettings,
        recipientEmails: updated,
        preconfiguredEmail: updated.join(', '),
      });
    }

    setNewEmailInput('');
    setEmailError('');
  };

  const handleRemoveRecipientEmail = (emailToRemove: string) => {
    const updated = currentRecipients.filter((e) => e.toLowerCase() !== emailToRemove.toLowerCase());
    setFixedEmails(updated);
    saveFixedPartsOrderEmails(updated);

    setFormData((prev) => ({
      ...prev,
      recipientEmails: updated,
    }));

    if (onUpdateAppSettings && appSettings) {
      onUpdateAppSettings({
        ...appSettings,
        recipientEmails: updated,
        preconfiguredEmail: updated.join(', '),
      });
    }
  };

  const handleSaveAndClose = () => {
    onSave({
      ...formData,
      recipientEmails: currentRecipients,
    });
    onClose();
  };

  const constructEmailBody = () => {
    const tag = formData.tag || reportTag || 'N/A';
    const os = formData.os || reportOs || 'N/A';
    const equip = formData.equipamento || reportEquipment || 'N/A';
    const solicitante = formData.solicitante || reportTechnician || 'Carlos A. Castro';
    const dataReq = formData.data || new Date().toISOString().split('T')[0];
    const areaReq = formData.area || 'Oficina Central de Manutenção';

    const validItems = formData.items.filter(
      (item) => item.codigo.trim() || item.quantidade.trim() || item.descricaoPartNumber.trim()
    );

    let itemsList = '';
    if (validItems.length === 0) {
      itemsList = 'Nenhum item cadastrado até o momento.\n';
    } else {
      itemsList = validItems
        .map((item, index) => {
          const num = String(index + 1).padStart(2, '0');
          const cod = item.codigo ? `[Cód: ${item.codigo}]` : '[Sem Cód]';
          const qtd = item.quantidade ? `(Qtd: ${item.quantidade})` : '(Qtd: 1)';
          const desc = item.descricaoPartNumber || 'Sem descrição informada';
          return `${num}. ${cod} ${qtd} - ${desc}`;
        })
        .join('\n');
    }

    return `Prezados,

Segue a Lista para Pedido de Peças / Requisição Oficial da Oficina Central de Manutenção:

==========================================
DADOS DA REQUISIÇÃO DE PEÇAS:
==========================================
• Equipamento: ${equip}
• TAG: ${tag}
• Ordem de Serviço (OS): ${os}
• Solicitante (POR): ${solicitante}
• Data da Requisição: ${dataReq}
• Área / Setor: ${areaReq}
• Destinatários: ${currentRecipients.join(', ')}

==========================================
RELAÇÃO DE PEÇAS SOLICITADAS:
==========================================
${itemsList}
==========================================
Total de itens requisitados: ${validItems.length} item(ns)

* Documento formal em PDF de alta qualidade anexado a este e-mail.

Atenciosamente,
${solicitante}
Oficina Central de Manutenção - Kinross Brasil Mineração`;
  };

  // Generate Parts Order PDF, save file, and launch Gmail app with attached PDF
  const handleSendEmail = async () => {
    // 1. Persist current sheet edits
    onSave(formData);

    const tag = formData.tag || reportTag || 'N/A';
    const os = formData.os || reportOs || 'N/A';
    const equip = formData.equipamento || reportEquipment || 'N/A';
    const technician = formData.solicitante || reportTechnician || 'Carlos A. Castro';

    const recipientsString = currentRecipients.join(', ');
    const subject = `[Pedido de Peças Kinross] TAG: ${tag} • OS: ${os} - ${equip}`;
    const body = constructEmailBody();

    setIsGeneratingPdf(true);

    try {
      // 2. Generate the dedicated Parts Order PDF
      const pdfResult = await generatePartsOrderPDF(
        formData,
        {
          tag,
          os,
          equipment: equip,
          technician,
        },
        appSettings
      );

      const base64 = await blobToBase64(pdfResult.blob);

      // 3. Save/Download PDF locally to ensure device persistence
      if (typeof window !== 'undefined' && (window as any).Android?.savePdf) {
        try {
          (window as any).Android.savePdf(base64, pdfResult.filename);
        } catch (e) {
          console.warn('Android savePdf fallback:', e);
        }
      } else {
        try {
          const a = document.createElement('a');
          a.href = pdfResult.blobUrl;
          a.download = pdfResult.filename;
          a.style.display = 'none';
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            if (document.body.contains(a)) document.body.removeChild(a);
          }, 300);
        } catch (e) {
          console.warn('Web download fallback:', e);
        }
      }

      // 4. Android APK Bridge: Opens official Gmail app directly with ATTACHED PDF!
      if (typeof window !== 'undefined' && (window as any).Android) {
        try {
          if ((window as any).Android.sendEmailWithPdf) {
            (window as any).Android.sendEmailWithPdf(
              recipientsString,
              subject,
              body,
              base64,
              pdfResult.filename
            );
            setEmailStatus('opened');
            setTimeout(() => setEmailStatus('idle'), 4000);
            return;
          } else if ((window as any).Android.openGmail) {
            (window as any).Android.openGmail(recipientsString, subject, body);
            setEmailStatus('opened');
            setTimeout(() => setEmailStatus('idle'), 4000);
            return;
          }
        } catch (err) {
          console.warn('Android bridge error, falling back:', err);
        }
      }

      // 5. Try Web Share API with attached PDF file on Android (Native Share -> Gmail)
      if (typeof navigator !== 'undefined' && navigator.canShare) {
        try {
          const file = new File([pdfResult.blob], pdfResult.filename, { type: 'application/pdf' });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: subject,
              text: body,
              files: [file],
            });
            setEmailStatus('opened');
            setTimeout(() => setEmailStatus('idle'), 4000);
            return;
          }
        } catch (err) {
          console.log('Native share skipped or cancelled', err);
        }
      }

      // 6. Direct Gmail Compose & Mailto Fallback
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipientsString)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      const mailtoUrl = `mailto:${encodeURIComponent(recipientsString)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      const newWindow = window.open(gmailUrl, '_blank');
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        window.location.href = mailtoUrl;
      }

      setEmailStatus('opened');
      setTimeout(() => setEmailStatus('idle'), 4000);
    } catch (err) {
      console.error('Error generating PDF or opening Gmail:', err);
      // Fallback simple mailto
      const mailtoUrl = `mailto:${encodeURIComponent(recipientsString)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoUrl;
      setEmailStatus('opened');
      setTimeout(() => setEmailStatus('idle'), 4000);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(constructEmailBody());
    setEmailStatus('copied');
    setTimeout(() => setEmailStatus('idle'), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-5xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-900">
        {/* Modal Header */}
        <div className="bg-white px-4 sm:px-6 py-3.5 border-b border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center border border-amber-300">
              <ClipboardList className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  LISTA P/ PEDIDO DE PEÇAS
                </h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold">
                  Manutenção Industrial
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                Preencha os códigos, quantidades e part numbers dos componentes solicitados.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle Enable in PDF */}
            <label className="hidden sm:flex items-center gap-2 cursor-pointer text-xs bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-amber-400">
              <input
                type="checkbox"
                checked={formData.enabled}
                onChange={(e) => setFormData((prev) => ({ ...prev, enabled: e.target.checked }))}
                className="rounded text-amber-600 focus:ring-amber-500 bg-white border-slate-300"
              />
              <span className="text-slate-800 font-semibold">Incluir no PDF do Relatório</span>
            </label>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-slate-800 text-xs bg-slate-50">
          {/* Header Metadata Grid */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-xs">
            <div className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-600" />
              Identificação do Pedido de Peças
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">DATA:</label>
                <input
                  type="date"
                  value={formData.data}
                  onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-amber-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">TAG:</label>
                <input
                  type="text"
                  placeholder="Ex: 4120-MD-001"
                  value={formData.tag}
                  onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-bold font-mono focus:outline-none focus:border-amber-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">EQUIPAMENTO:</label>
                <input
                  type="text"
                  placeholder="Ex: Moinho de Bolas"
                  value={formData.equipamento}
                  onChange={(e) => setFormData({ ...formData, equipamento: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-amber-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">POR (SOLICITANTE):</label>
                <input
                  type="text"
                  placeholder="Nome do técnico"
                  value={formData.solicitante}
                  onChange={(e) => setFormData({ ...formData, solicitante: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-amber-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">OS:</label>
                <input
                  type="text"
                  placeholder="Ex: 1009842"
                  value={formData.os}
                  onChange={(e) => setFormData({ ...formData, os: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-bold font-mono focus:outline-none focus:border-amber-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">ÁREA:</label>
                <input
                  type="text"
                  placeholder="Ex: Moagem / Britagem"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-amber-600 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section: Email Recipients Management for Parts Order */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-amber-600" />
                <span>DESTINATÁRIOS FIXOS DO PEDIDO DE PEÇAS</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-700" />
                  Fixo no App
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold">
                  {currentRecipients.length} destinatário{currentRecipients.length > 1 ? 's' : ''}
                </span>
              </div>
              <span className="text-[11px] text-slate-600 font-medium">
                E-mails salvos permanentemente no app para todas as abas e pedidos futuros
              </span>
            </div>

            {/* Recipient Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              {currentRecipients.map((email, idx) => {
                const isDefault = email.toLowerCase() === (fixedEmail || 'paulo.sousa@kinross.com').toLowerCase();
                return (
                  <span
                    key={`${email}-${idx}`}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                      isDefault
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-300 shadow-xs'
                        : 'bg-slate-100 text-slate-800 border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    <AtSign className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-mono">{email}</span>
                    {isDefault ? (
                      <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-200/80 text-emerald-950 border border-emerald-400">
                        Principal
                      </span>
                    ) : (
                      <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-200/80 text-amber-950 border border-amber-400">
                        Fixo
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveRecipientEmail(email)}
                      className="p-0.5 rounded hover:bg-slate-200 text-slate-500 hover:text-rose-600 transition"
                      title={`Remover ${email}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                );
              })}

              {currentRecipients.length === 0 && (
                <div className="flex items-center gap-2 text-xs text-rose-600 py-1 font-semibold">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>Nenhum destinatário fixado no aplicativo.</span>
                  <button
                    type="button"
                    onClick={() => handleAddRecipientEmail(fixedEmail || 'paulo.sousa@kinross.com')}
                    className="text-amber-700 hover:underline font-bold"
                  >
                    Restaurar {fixedEmail || 'paulo.sousa@kinross.com'}
                  </button>
                </div>
              )}
            </div>

            {/* Input to add more emails */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 pt-1">
              <div className="relative flex-1">
                <input
                  type="email"
                  value={newEmailInput}
                  onChange={(e) => {
                    setNewEmailInput(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddRecipientEmail();
                    }
                  }}
                  placeholder="Adicionar e-mail fixo para envios futuros (ex: almoxarifado@kinross.com)..."
                  className="w-full bg-white border border-slate-300 focus:border-amber-600 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition"
                />
              </div>

              <button
                type="button"
                onClick={() => handleAddRecipientEmail()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-xs transition shadow-xs flex-shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>+ Fixar Novo E-mail</span>
              </button>
            </div>

            {emailError && (
              <p className="text-[11px] text-rose-600 font-bold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {emailError}
              </p>
            )}
          </div>

          {/* Items Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-3 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <Box className="w-3.5 h-3.5 text-amber-600" />
                Itens e Peças Solicitadas ({formData.items.length} linhas)
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] transition shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Adicionar Linha</span>
                </button>

                <button
                  type="button"
                  onClick={handleClearAll}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[11px] transition"
                  title="Limpar tabela"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Limpar</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 uppercase text-[10px] tracking-wider font-bold">
                    <th className="py-2.5 px-3 w-12 text-center">#</th>
                    <th className="py-2.5 px-3 w-36">CÓDIGO</th>
                    <th className="py-2.5 px-3 w-32 text-center">QUANTIDADE</th>
                    <th className="py-2.5 px-3">DESCRIÇÃO / PART NUMBER</th>
                    <th className="py-2.5 px-3 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono">
                  {formData.items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition">
                      <td className="py-2 px-3 text-center text-slate-500 text-[11px] font-semibold">
                        {String(idx + 1).padStart(2, '0')}
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          placeholder="Ex: 502931"
                          value={item.codigo}
                          onChange={(e) => handleUpdateItem(item.id, 'codigo', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-amber-600 rounded px-2 py-1 text-xs text-slate-900 placeholder:text-slate-400 font-semibold"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          placeholder="Ex: 02 UN"
                          value={item.quantidade}
                          onChange={(e) => handleUpdateItem(item.id, 'quantidade', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-amber-600 rounded px-2 py-1 text-xs text-slate-900 placeholder:text-slate-400 text-center font-semibold"
                        />
                      </td>
                      <td className="py-2 px-3 font-sans">
                        <input
                          type="text"
                          placeholder="Ex: Rolamento Autocompensador 22220 EK/C3 SKF"
                          value={item.descricaoPartNumber}
                          onChange={(e) => handleUpdateItem(item.id, 'descricaoPartNumber', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-amber-600 rounded px-2 py-1 text-xs text-slate-900 placeholder:text-slate-400"
                        />
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1 rounded text-slate-500 hover:text-rose-600 hover:bg-slate-100 transition"
                          title="Remover linha"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Lower Action & Email Dispatch Bar */}
        <div className="bg-slate-100 border-t border-slate-200 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center border border-emerald-300 flex-shrink-0">
              <Mail className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="flex flex-col text-slate-800">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-600 font-semibold">Destinatários ({currentRecipients.length}):</span>
                <span className="font-mono text-emerald-800 font-bold text-xs">
                  {currentRecipients.length === 1
                    ? currentRecipients[0]
                    : `${currentRecipients[0]} (+${currentRecipients.length - 1} outro${currentRecipients.length > 2 ? 's' : ''})`}
                </span>
              </div>
              <span className="text-[10px] text-slate-600 font-medium">
                Gera o PDF da lista de peças e abre o app do Gmail com o PDF anexado
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-copy-parts-text"
              onClick={handleCopyText}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-300 transition active:scale-95 shadow-xs"
              title="Copiar texto formatado da requisição para a área de transferência"
            >
              {emailStatus === 'copied' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copiar Texto</span>
                </>
              )}
            </button>

            {/* Main Action Button: Opens Gmail with PDF attachment */}
            <button
              type="button"
              id="btn-send-parts-order-email"
              disabled={isGeneratingPdf}
              onClick={handleSendEmail}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition active:scale-95 ${
                isGeneratingPdf
                  ? 'bg-slate-200 text-slate-500 cursor-not-allowed border border-slate-300'
                  : emailStatus === 'opened'
                  ? 'bg-emerald-600 text-white border border-emerald-700'
                  : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-700/20 border border-emerald-600'
              }`}
              title={`Abrir app do Gmail com a lista de peças em PDF anexada para: ${currentRecipients.join(', ')}`}
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-200" />
                  <span>Gerando PDF & Abrindo Gmail...</span>
                </>
              ) : emailStatus === 'opened' ? (
                <>
                  <Check className="w-4 h-4 text-white animate-bounce" />
                  <span>E-mail & PDF Aberto no Gmail!</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>
                    {currentRecipients.length === 1
                      ? `Enviar E-mail (${currentRecipients[0]})`
                      : `Enviar E-mail (${currentRecipients[0]} +${currentRecipients.length - 1})`}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-white px-4 sm:px-6 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="chk-enable-parts-pdf"
              checked={formData.enabled}
              onChange={(e) => setFormData((prev) => ({ ...prev, enabled: e.target.checked }))}
              className="rounded text-amber-600 focus:ring-amber-500 bg-white border-slate-300"
            />
            <label htmlFor="chk-enable-parts-pdf" className="text-xs text-slate-800 cursor-pointer font-semibold">
              Ativar e incluir esta folha no documento PDF final do relatório
            </label>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-300 transition"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSaveAndClose}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white font-bold text-xs shadow-md shadow-amber-600/20 transition active:scale-95 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Salvar Lista de Peças</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

