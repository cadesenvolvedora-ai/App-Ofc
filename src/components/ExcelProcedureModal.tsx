import React from 'react';
import { 
  X, 
  Check, 
  FileSpreadsheet, 
  RotateCcw,
  Sparkles,
  CheckCircle2,
  CheckCheck
} from 'lucide-react';
import { ProcedureSheet } from '../types';

interface ExcelProcedureModalProps {
  isOpen: boolean;
  onClose: () => void;
  sheet: ProcedureSheet;
  reportTag: string;
  reportOs: string;
  onSave: (updated: ProcedureSheet) => void;
}

export const ExcelProcedureModal: React.FC<ExcelProcedureModalProps> = ({
  isOpen,
  onClose,
  sheet,
  reportTag,
  reportOs,
  onSave,
}) => {
  if (!isOpen) return null;

  const handleToggleSituation = (itemId: string, situation: 'S' | 'N' | 'NA') => {
    const updated: ProcedureSheet = JSON.parse(JSON.stringify(sheet));
    for (const section of updated.sections) {
      const found = section.items.find((it) => it.id === itemId);
      if (found) {
        // If clicking already selected, toggle off or switch
        found.situacao = found.situacao === situation ? '' : situation;
        break;
      }
    }
    updated.enabled = true;
    onSave(updated);
  };

  const handleObservationChange = (itemId: string, obs: string) => {
    const updated: ProcedureSheet = JSON.parse(JSON.stringify(sheet));
    for (const section of updated.sections) {
      const found = section.items.find((it) => it.id === itemId);
      if (found) {
        found.observacao = obs;
        break;
      }
    }
    updated.enabled = true;
    onSave(updated);
  };

  const handleFieldChange = (field: 'componente' | 'tipoOs' | 'nUnid' | 'osPai' | 'conclusao', val: string) => {
    const updated: ProcedureSheet = { ...sheet, [field]: val, enabled: true };
    onSave(updated);
  };

  const handleMarkAllSim = () => {
    const updated: ProcedureSheet = JSON.parse(JSON.stringify(sheet));
    for (const section of updated.sections) {
      for (const item of section.items) {
        // If it's a question like "NECESSÁRIO TROCA DOS ROLAMENTOS?", let's leave it or set S/N
        item.situacao = 'S';
      }
    }
    updated.enabled = true;
    onSave(updated);
  };

  const [clearedNotice, setClearedNotice] = React.useState(false);

  const handleClearAll = () => {
    const updated: ProcedureSheet = JSON.parse(JSON.stringify(sheet));
    updated.componente = '';
    updated.tipoOs = '';
    updated.nUnid = '';
    updated.osPai = '';
    updated.conclusao = '';
    for (const section of updated.sections) {
      for (const item of section.items) {
        item.situacao = '';
        item.observacao = '';
      }
    }
    updated.enabled = false;
    onSave(updated);
    setClearedNotice(true);
    setTimeout(() => setClearedNotice(false), 2500);
  };

  const titleMap = {
    REDUTORES: 'PROCEDIMENTO DE REFORMA - REDUTORES',
    BOMBAS: 'PROCEDIMENTO DE REFORMA - BOMBAS',
    MANCAIS: 'PROCEDIMENTO DE REFORMA - MANCAIS',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Excel Ribbon Top Bar */}
        <div className="bg-[#107c41] px-4 py-2.5 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <FileSpreadsheet className="w-5 h-5 text-white" />
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold bg-white/20 px-2 py-0.5 rounded text-white">
                PLANILHA EXCEL
              </span>
              <h3 className="text-sm font-bold tracking-wide uppercase">
                {titleMap[sheet.tipo]}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Toggle Include in PDF */}
            <label className="flex items-center gap-2 cursor-pointer bg-black/20 px-2.5 py-1 rounded-lg hover:bg-black/30 transition text-xs">
              <input
                type="checkbox"
                checked={sheet.enabled}
                onChange={(e) => onSave({ ...sheet, enabled: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="font-semibold text-white">
                {sheet.enabled ? '✓ Incluído no Relatório PDF' : 'Desativado no PDF'}
              </span>
            </label>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
              title="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action & Formula Bar */}
        <div className="bg-black px-4 py-2 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="font-mono bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded text-amber-400 font-bold">
              KINROSS Paracatu • Oficina Central
            </span>
          </div>

          <div className="flex items-center gap-2">
            {clearedNotice && (
              <span className="text-[11px] font-medium text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40 animate-pulse">
                ✓ Planilha Limpa
              </span>
            )}
            <button
              type="button"
              onClick={handleMarkAllSim}
              className="px-2.5 py-1 rounded bg-emerald-950 border border-emerald-700/60 text-emerald-300 hover:bg-emerald-900 text-xs font-medium flex items-center gap-1.5 transition"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Marcar Todos como S (Sim)
            </button>

            <button
              type="button"
              onClick={handleClearAll}
              className="px-2.5 py-1 rounded bg-rose-950/60 border border-rose-700/60 text-rose-300 hover:bg-rose-900 text-xs font-medium flex items-center gap-1.5 transition active:scale-95"
              title="Apagar todos os campos desta planilha"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Limpar Planilha
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-3 sm:p-5 overflow-y-auto space-y-4 bg-black text-zinc-200 text-xs">
          {/* Kinross Institutional Banner Header */}
          <div className="border border-neutral-800 bg-neutral-950 rounded-xl overflow-hidden">
            <div className="bg-neutral-900 px-4 py-2 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-400 tracking-wider text-xs">KINROSS</span>
                <span className="text-[10px] text-zinc-400">Paracatu</span>
              </div>
              <div className="font-bold text-white text-xs tracking-wide">
                {titleMap[sheet.tipo]}
              </div>
              <div className="text-[11px] font-mono text-amber-300 uppercase">
                OFICINA CENTRAL
              </div>
            </div>

            {/* Sub-Header Metadata Inputs */}
            <div className="p-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 bg-neutral-950">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">OS:</label>
                <input
                  type="text"
                  value={reportOs}
                  disabled
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-300 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">TAG:</label>
                <input
                  type="text"
                  value={reportTag}
                  disabled
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-300 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">COMPONENTE:</label>
                <input
                  type="text"
                  value={sheet.componente || ''}
                  onChange={(e) => handleFieldChange('componente', e.target.value)}
                  placeholder={`Ex: ${sheet.tipo}`}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">TIPO OS:</label>
                <input
                  type="text"
                  value={sheet.tipoOs || ''}
                  onChange={(e) => handleFieldChange('tipoOs', e.target.value)}
                  placeholder="Ex: PREVENTIVA / CORRETIVA"
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">N UNID:</label>
                <input
                  type="text"
                  value={sheet.nUnid || ''}
                  onChange={(e) => handleFieldChange('nUnid', e.target.value)}
                  placeholder="Ex: 01"
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">OS PAI:</label>
                <input
                  type="text"
                  value={sheet.osPai || ''}
                  onChange={(e) => handleFieldChange('osPai', e.target.value)}
                  placeholder="Ex: OS PAI"
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Checklist Sections */}
          <div className="space-y-4">
            {sheet.sections.map((section) => (
              <div 
                key={section.sectionNumber} 
                className="border border-slate-700 rounded-xl overflow-hidden bg-slate-950 shadow-md"
              >
                {/* Section Title */}
                <div className="bg-slate-800 px-3 py-1.5 font-bold text-slate-100 flex items-center justify-between border-b border-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-xs flex items-center justify-center font-bold">
                      {section.sectionNumber}
                    </span>
                    <span className="tracking-wide">
                      {section.sectionNumber} - {section.sectionName}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {section.items.filter(i => i.situacao).length} / {section.items.length} verificados
                  </span>
                </div>

                {/* Table Layout */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-900/90 text-slate-400 font-bold border-b border-slate-800 text-[11px]">
                        <th className="py-2 px-3">ITENS DE VERIFICAÇÃO</th>
                        <th className="py-2 px-3 text-center w-36 sm:w-44">
                          SITUAÇÃO
                          <div className="flex justify-center gap-4 text-[9px] text-slate-500 font-normal mt-0.5">
                            <span className="text-emerald-400 font-bold">S</span>
                            <span className="text-rose-400 font-bold">N</span>
                            <span className="text-slate-400 font-bold">NA</span>
                          </div>
                        </th>
                        <th className="py-2 px-3 w-44 sm:w-64">OBSERVAÇÃO</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {section.items.map((item, idx) => (
                        <tr 
                          key={item.id}
                          className={`hover:bg-slate-800/40 transition ${
                            idx % 2 === 0 ? 'bg-slate-950' : 'bg-slate-900/40'
                          }`}
                        >
                          {/* Item Description */}
                          <td className="py-2.5 px-3 text-slate-200 font-medium leading-relaxed">
                            {item.item}
                          </td>

                          {/* Situation S / N / NA */}
                          <td className="py-2 px-3 text-center">
                            <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-900 border border-slate-800 gap-1">
                              <button
                                type="button"
                                onClick={() => handleToggleSituation(item.id, 'S')}
                                className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                                  item.situacao === 'S'
                                    ? 'bg-emerald-600 text-white shadow'
                                    : 'text-slate-400 hover:text-emerald-300'
                                }`}
                                title="Sim / Conforme"
                              >
                                S
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleSituation(item.id, 'N')}
                                className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                                  item.situacao === 'N'
                                    ? 'bg-rose-600 text-white shadow'
                                    : 'text-slate-400 hover:text-rose-300'
                                }`}
                                title="Não / Não Conforme"
                              >
                                N
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleSituation(item.id, 'NA')}
                                className={`px-2 py-1 rounded text-xs font-bold transition ${
                                  item.situacao === 'NA'
                                    ? 'bg-slate-600 text-white shadow'
                                    : 'text-slate-400 hover:text-slate-200'
                                }`}
                                title="Não Aplicável"
                              >
                                NA
                              </button>
                            </div>
                          </td>

                          {/* Observação */}
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={item.observacao || ''}
                              onChange={(e) => handleObservationChange(item.id, e.target.value)}
                              placeholder="Observações do item..."
                              className="w-full bg-slate-900 border border-slate-700/80 rounded px-2 py-1 text-slate-200 text-xs focus:border-emerald-500 focus:outline-none"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>

          {/* Conclusão */}
          <div className="border border-slate-700 rounded-xl overflow-hidden bg-slate-950 p-3.5 shadow-md">
            <label className="block font-bold text-slate-100 mb-1.5 uppercase tracking-wide">
              CONCLUSÃO TÉCNICA DO PROCEDIMENTO:
            </label>
            <textarea
              rows={3}
              value={sheet.conclusao || ''}
              onChange={(e) => handleFieldChange('conclusao', e.target.value)}
              placeholder="Descreva a conclusão final da reforma, aprovação de testes de giro, montagem e estanqueidade..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-xs focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-3 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <CheckCircle2 className={`w-4 h-4 ${sheet.enabled ? 'text-emerald-400' : 'text-slate-500'}`} />
            <span>
              {sheet.enabled 
                ? 'Este procedimento técnico será incluído no final do relatório em PDF.' 
                : 'Procedimento desativado para o PDF (marque a caixa acima para incluir).'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
            >
              Fechar
            </button>
            <button
              type="button"
              onClick={() => {
                onSave({ ...sheet, enabled: true });
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Salvar & Ativar no PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
