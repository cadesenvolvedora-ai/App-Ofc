import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  FileSpreadsheet, 
  CheckCircle2, 
  RotateCcw, 
  ClipboardList, 
  Hash, 
  Box, 
  Layers,
  Mail,
  Copy,
  Check,
  Send
} from 'lucide-react';
import { PartsOrderSheet, PartsOrderItem } from '../types';

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
}) => {
  const [formData, setFormData] = useState<PartsOrderSheet>(() => {
    return {
      ...sheet,
      tag: sheet.tag || reportTag || '',
      os: sheet.os || reportOs || '',
      data: sheet.data || new Date().toISOString().split('T')[0],
    };
  });

  const [emailStatus, setEmailStatus] = useState<'idle' | 'copied' | 'opened'>('idle');

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

  const handleSaveAndClose = () => {
    onSave(formData);
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

Segue a Lista para Pedido de Peças / Requisição da Oficina Central de Manutenção:

==========================================
DADOS DA REQUISIÇÃO DE PEÇAS:
==========================================
• Equipamento: ${equip}
• TAG: ${tag}
• Ordem de Serviço (OS): ${os}
• Solicitante (POR): ${solicitante}
• Data da Requisição: ${dataReq}
• Área / Setor: ${areaReq}

==========================================
RELAÇÃO DE PEÇAS SOLICITADAS:
==========================================
${itemsList}
==========================================
Total de itens requisitados: ${validItems.length} item(ns)

Atenciosamente,
${solicitante}
Oficina Central de Manutenção`;
  };

  const handleSendEmail = async () => {
    // Persist current sheet edits first
    onSave(formData);

    const tag = formData.tag || reportTag || 'N/A';
    const os = formData.os || reportOs || 'N/A';
    const equip = formData.equipamento || reportEquipment || 'N/A';
    const targetEmail = fixedEmail || 'paulo.sousa@kinross.com';

    const subject = `[Pedido de Peças] TAG: ${tag} • OS: ${os} - ${equip}`;
    const body = constructEmailBody();

    // 1. Try mobile native share if available (opens native Gmail / mail app with pre-filled content)
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: subject,
          text: body,
        });
        setEmailStatus('opened');
        setTimeout(() => setEmailStatus('idle'), 3000);
        return;
      } catch (err) {
        console.log('Share dismissed or cancelled', err);
      }
    }

    // 2. Direct Gmail Web Compose link with fixed recipient
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(targetEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    const mailtoUrl = `mailto:${encodeURIComponent(targetEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    const newWindow = window.open(gmailUrl, '_blank');
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      window.location.href = mailtoUrl;
    }

    setEmailStatus('opened');
    setTimeout(() => setEmailStatus('idle'), 3000);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(constructEmailBody());
    setEmailStatus('copied');
    setTimeout(() => setEmailStatus('idle'), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-5xl bg-neutral-950 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-black px-4 sm:px-6 py-3.5 border-b border-neutral-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  LISTA P/ PEDIDO DE PEÇAS
                </h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/60 font-semibold">
                  Manutenção Industrial
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Preencha os códigos, quantidades e part numbers dos componentes solicitados.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle Enable in PDF */}
            <label className="hidden sm:flex items-center gap-2 cursor-pointer text-xs bg-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-800 hover:border-amber-500/40">
              <input
                type="checkbox"
                checked={formData.enabled}
                onChange={(e) => setFormData((prev) => ({ ...prev, enabled: e.target.checked }))}
                className="rounded text-amber-500 focus:ring-amber-500 bg-black border-neutral-700"
              />
              <span className="text-zinc-300 font-medium">Incluir no PDF</span>
            </label>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-neutral-900 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-zinc-200 text-xs">
          {/* Header Metadata Grid */}
          <div className="bg-black rounded-xl border border-neutral-800 p-4 space-y-3">
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              Identificação do Pedido de Peças
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">DATA:</label>
                <input
                  type="date"
                  value={formData.data}
                  onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">TAG:</label>
                <input
                  type="text"
                  placeholder="Ex: 4120-MD-001"
                  value={formData.tag}
                  onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">EQUIPAMENTO:</label>
                <input
                  type="text"
                  placeholder="Ex: Moinho de Bolas"
                  value={formData.equipamento}
                  onChange={(e) => setFormData({ ...formData, equipamento: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">POR (SOLICITANTE):</label>
                <input
                  type="text"
                  placeholder="Nome do técnico"
                  value={formData.solicitante}
                  onChange={(e) => setFormData({ ...formData, solicitante: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">OS:</label>
                <input
                  type="text"
                  placeholder="Ex: 1009842"
                  value={formData.os}
                  onChange={(e) => setFormData({ ...formData, os: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">ÁREA:</label>
                <input
                  type="text"
                  placeholder="Ex: Moagem / Britagem"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="bg-black rounded-xl border border-neutral-800 overflow-hidden">
            <div className="p-3 bg-neutral-900/80 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold text-white text-xs flex items-center gap-1.5">
                <Box className="w-3.5 h-3.5 text-amber-400" />
                Itens e Peças Solicitadas ({formData.items.length} linhas)
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-[11px] transition shadow"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Adicionar Linha</span>
                </button>

                <button
                  type="button"
                  onClick={handleClearAll}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-zinc-300 font-semibold text-[11px] transition"
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
                  <tr className="bg-neutral-900 text-zinc-400 border-b border-neutral-800 uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3 w-12 text-center">#</th>
                    <th className="py-2.5 px-3 w-36">CÓDIGO</th>
                    <th className="py-2.5 px-3 w-32 text-center">QUANTIDADE</th>
                    <th className="py-2.5 px-3">DESCRIÇÃO / PART NUMBER</th>
                    <th className="py-2.5 px-3 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 font-mono">
                  {formData.items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-neutral-900/40 transition">
                      <td className="py-2 px-3 text-center text-zinc-500 text-[11px]">
                        {String(idx + 1).padStart(2, '0')}
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          placeholder="Ex: 502931"
                          value={item.codigo}
                          onChange={(e) => handleUpdateItem(item.id, 'codigo', e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded px-2 py-1 text-xs text-white"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          placeholder="Ex: 02 UN"
                          value={item.quantidade}
                          onChange={(e) => handleUpdateItem(item.id, 'quantidade', e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded px-2 py-1 text-xs text-white text-center"
                        />
                      </td>
                      <td className="py-2 px-3 font-sans">
                        <input
                          type="text"
                          placeholder="Ex: Rolamento Autocompensador 22220 EK/C3 SKF"
                          value={item.descricaoPartNumber}
                          onChange={(e) => handleUpdateItem(item.id, 'descricaoPartNumber', e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded px-2 py-1 text-xs text-white"
                        />
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-neutral-900 transition"
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
        <div className="bg-neutral-900/95 border-t border-neutral-800 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 flex-shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2 text-zinc-300">
              <span className="text-[11px] text-zinc-400 font-medium">Destinatário Fixo:</span>
              <span className="font-mono text-emerald-400 font-bold text-xs bg-emerald-950/70 px-2.5 py-0.5 rounded border border-emerald-800/50">
                {fixedEmail}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-copy-parts-text"
              onClick={handleCopyText}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-zinc-300 font-semibold text-xs border border-neutral-700 transition active:scale-95"
              title="Copiar texto formatado da requisição para a área de transferência"
            >
              {emailStatus === 'copied' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Copiar Texto</span>
                </>
              )}
            </button>

            <button
              type="button"
              id="btn-send-parts-order-email"
              onClick={handleSendEmail}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/70 border border-emerald-500/40 transition active:scale-95"
              title={`Enviar lista de peças via E-mail diretamente para ${fixedEmail}`}
            >
              {emailStatus === 'opened' ? (
                <>
                  <Check className="w-4 h-4 text-white animate-bounce" />
                  <span>E-mail Aberto!</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Enviar E-mail ({fixedEmail})</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-black px-4 sm:px-6 py-3 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="chk-enable-parts-pdf"
              checked={formData.enabled}
              onChange={(e) => setFormData((prev) => ({ ...prev, enabled: e.target.checked }))}
              className="rounded text-amber-500 focus:ring-amber-500 bg-neutral-900 border-neutral-700"
            />
            <label htmlFor="chk-enable-parts-pdf" className="text-xs text-zinc-300 cursor-pointer font-medium">
              Ativar e incluir esta folha no documento PDF final
            </label>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-zinc-300 font-semibold text-xs transition"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSaveAndClose}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-bold text-xs shadow-md shadow-amber-950/60 transition active:scale-95 flex items-center gap-1.5"
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
