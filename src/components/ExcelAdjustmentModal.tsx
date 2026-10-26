import React from 'react';
import { 
  X, 
  Check, 
  FileSpreadsheet, 
  Layers, 
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Sliders,
  Ruler
} from 'lucide-react';
import { ReductionAdjustmentSheet } from '../types';

interface ExcelAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ReductionAdjustmentSheet;
  reportTag: string;
  reportOs: string;
  onSave: (updated: ReductionAdjustmentSheet) => void;
}

export const ExcelAdjustmentModal: React.FC<ExcelAdjustmentModalProps> = ({
  isOpen,
  onClose,
  data,
  reportTag,
  reportOs,
  onSave,
}) => {
  if (!isOpen) return null;

  const handleFieldChange = (path: string, val: string) => {
    const updated = JSON.parse(JSON.stringify(data)) as ReductionAdjustmentSheet;
    if (!updated.eixo) updated.eixo = { eixoAR: { la: '', loa: '' }, eixoInt: { la: '', loa: '' }, eixoInt2: { la: '', loa: '' }, eixoBR: { la: '', loa: '' }, comentarios: '' };
    if (!updated.eixo.eixoInt2) updated.eixo.eixoInt2 = { la: '', loa: '' };
    if (!updated.mancal) updated.mancal = { carcacaAR: { laMedida: '', laProjeto: '', loaMedida: '', loaProjeto: '' }, carcacaInt: { laMedida: '', laProjeto: '', loaMedida: '', loaProjeto: '' }, carcacaInt2: { laMedida: '', laProjeto: '', loaMedida: '', loaProjeto: '' }, carcacaBR: { laMedida: '', laProjeto: '', loaMedida: '', loaProjeto: '' }, comentarios: '' };
    if (!updated.mancal.carcacaInt2) updated.mancal.carcacaInt2 = { laMedida: '', laProjeto: '', loaMedida: '', loaProjeto: '' };
    if (!updated.rolamentos) updated.rolamentos = { eixoAR: { laNum: '', laFolga: '', loaNum: '', loaFolga: '' }, eixoInt: { laNum: '', laFolga: '', loaNum: '', loaFolga: '' }, eixoInt2: { laNum: '', laFolga: '', loaNum: '', loaFolga: '' }, eixoBR: { laNum: '', laFolga: '', loaNum: '', loaFolga: '' } };
    if (!updated.rolamentos.eixoInt2) updated.rolamentos.eixoInt2 = { laNum: '', laFolga: '', loaNum: '', loaFolga: '' };
    if (!updated.folgasAxiais) updated.folgasAxiais = { eixoAR: { ref: '', med1: '', med2: '' }, eixoInt: { ref: '', med1: '', med2: '' }, eixoInt2: { ref: '', med1: '', med2: '' }, eixoBR: { ref: '', med1: '', med2: '' } };
    if (!updated.folgasAxiais.eixoInt2) updated.folgasAxiais.eixoInt2 = { ref: '', med1: '', med2: '' };

    const parts = path.split('.');
    let cur: any = updated;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!cur[parts[i]]) cur[parts[i]] = {};
      cur = cur[parts[i]];
    }
    cur[parts[parts.length - 1]] = val;
    // Auto enable if user enters data
    updated.enabled = true;
    onSave(updated);
  };

  const handleToggleEnabled = (enabled: boolean) => {
    onSave({ ...data, enabled });
  };

  const [clearedNotice, setClearedNotice] = React.useState(false);

  const handleClear = () => {
    onSave({
      enabled: false,
      componente: '',
      tipoOs: '',
      nUnid: '',
      idPatrim: '',
      eixo: {
        eixoAR: { la: '', loa: '' },
        eixoInt: { la: '', loa: '' },
        eixoInt2: { la: '', loa: '' },
        eixoBR: { la: '', loa: '' },
        comentarios: '',
      },
      mancal: {
        carcacaAR: { laMedida: '', laProjeto: '', loaMedida: '', loaProjeto: '' },
        carcacaInt: { laMedida: '', laProjeto: '', loaMedida: '', loaProjeto: '' },
        carcacaInt2: { laMedida: '', laProjeto: '', loaMedida: '', loaProjeto: '' },
        carcacaBR: { laMedida: '', laProjeto: '', loaMedida: '', loaProjeto: '' },
        comentarios: '',
      },
      rolamentos: {
        eixoAR: { laNum: '', laFolga: '', loaNum: '', loaFolga: '' },
        eixoInt: { laNum: '', laFolga: '', loaNum: '', loaFolga: '' },
        eixoInt2: { laNum: '', laFolga: '', loaNum: '', loaFolga: '' },
        eixoBR: { laNum: '', laFolga: '', loaNum: '', loaFolga: '' },
      },
      engrenamentoComentarios: '',
      carcacaComentarios: '',
      folgasAxiais: {
        eixoAR: { ref: '', med1: '', med2: '' },
        eixoInt: { ref: '', med1: '', med2: '' },
        eixoInt2: { ref: '', med1: '', med2: '' },
        eixoBR: { ref: '', med1: '', med2: '' },
      },
      servicosComentariosAdicionais: '',
    });
    setClearedNotice(true);
    setTimeout(() => setClearedNotice(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Excel Header Ribbon */}
        <div className="bg-[#107c41] px-4 py-2.5 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <FileSpreadsheet className="w-5 h-5 text-white" />
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold bg-white/20 px-2 py-0.5 rounded text-white">
                PLANILHA EXCEL
              </span>
              <h3 className="text-sm font-bold tracking-wide uppercase">
                Folha de Ajustes - Redutores
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Toggle Include in PDF */}
            <label className="flex items-center gap-2 cursor-pointer bg-black/20 px-2.5 py-1 rounded-lg hover:bg-black/30 transition text-xs">
              <input
                type="checkbox"
                checked={data.enabled}
                onChange={(e) => handleToggleEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="font-semibold text-white">
                {data.enabled ? '✓ Incluído no Relatório PDF' : 'Desativado no PDF'}
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

        {/* Excel Formula / Breadcrumb Bar */}
        <div className="bg-slate-100 px-4 py-1.5 border-b border-slate-200 flex items-center justify-between text-xs text-slate-700">
          <div className="flex items-center gap-3 font-mono">
            <span className="bg-white border border-slate-300 px-2 py-0.5 rounded text-slate-800 font-bold">A1:Z100</span>
            <span className="text-slate-400">|</span>
            <span className="text-amber-800 font-bold">KINROSS Paracatu • Oficina Central</span>
          </div>

          <div className="flex items-center gap-2">
            {clearedNotice && (
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                ✓ Todos os campos foram apagados
              </span>
            )}
            <button
              type="button"
              id="btn-limpar-planilha-ajustes"
              onClick={handleClear}
              className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-800 text-[11px] font-bold flex items-center gap-1.5 transition active:scale-95 shadow-xs"
              title="Apagar todos os campos desta planilha"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Limpar Planilha
            </button>
          </div>
        </div>

        {/* Excel Sheet Scrollable Content */}
        <div className="p-3 sm:p-5 overflow-y-auto space-y-5 bg-slate-50 text-slate-900 text-xs">
          {/* Kinross Institutional Banner Header */}
          <div className="border border-slate-200 bg-white rounded-xl overflow-hidden shadow-xs">
            <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-800 tracking-wider text-xs">KINROSS</span>
                <span className="text-[10px] text-slate-600 font-medium">Paracatu</span>
              </div>
              <div className="font-bold text-slate-900 text-xs tracking-wide">
                FOLHA DE AJUSTES - REDUTORES
              </div>
              <div className="text-[11px] font-mono text-amber-900 font-bold uppercase">
                OFICINA CENTRAL
              </div>
            </div>

            {/* Sub-Header Metadata Inputs */}
            <div className="p-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 bg-white">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-700 mb-1">OS:</label>
                <input
                  type="text"
                  value={data.tipoOs ? reportOs : reportOs}
                  disabled
                  className="w-full bg-slate-100 border border-slate-300 rounded px-2 py-1 text-slate-800 font-mono text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-700 mb-1">TAG:</label>
                <input
                  type="text"
                  value={reportTag}
                  disabled
                  className="w-full bg-slate-100 border border-slate-300 rounded px-2 py-1 text-slate-800 font-mono text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-700 mb-1">COMPONENTE:</label>
                <input
                  type="text"
                  value={data.componente || ''}
                  onChange={(e) => handleFieldChange('componente', e.target.value)}
                  placeholder="Ex: REDUTOR FALK"
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 font-mono text-xs focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-700 mb-1">TIPO OS:</label>
                <input
                  type="text"
                  value={data.tipoOs || ''}
                  onChange={(e) => handleFieldChange('tipoOs', e.target.value)}
                  placeholder="Ex: CORRETIVA"
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 font-mono text-xs focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-700 mb-1">N UNID:</label>
                <input
                  type="text"
                  value={data.nUnid || ''}
                  onChange={(e) => handleFieldChange('nUnid', e.target.value)}
                  placeholder="Ex: 01"
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 font-mono text-xs focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-700 mb-1">ID/PATRIM:</label>
                <input
                  type="text"
                  value={data.idPatrim || ''}
                  onChange={(e) => handleFieldChange('idPatrim', e.target.value)}
                  placeholder="Ex: PAT-449"
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 font-mono text-xs focus:border-emerald-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 1: EIXO */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
            <div className="bg-slate-100 px-3 py-1.5 font-bold text-slate-800 flex items-center justify-between border-b border-slate-200">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                1. EIXO - MEDIDAS DAS BASES DE ROLAMENTOS
              </span>
              <span className="text-[10px] text-slate-600 font-medium">Tolerâncias e medidas em mm</span>
            </div>

            <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Eixo AR */}
              <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-200">
                <div className="font-bold text-slate-800 mb-2 border-b border-slate-200 pb-1 flex items-center justify-between">
                  <span>BASE ROLAMENTO EIXO A.R.</span>
                  <span className="text-[10px] text-slate-500 font-medium">Alta Rotação</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-700 w-10">LA:</span>
                    <input
                      type="text"
                      placeholder="Medida LA (ex: 85.012)"
                      value={data.eixo.eixoAR.la}
                      onChange={(e) => handleFieldChange('eixo.eixoAR.la', e.target.value)}
                      className="flex-1 bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 font-mono text-xs focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-700 w-10">LOA:</span>
                    <input
                      type="text"
                      placeholder="Medida LOA (ex: 85.015)"
                      value={data.eixo.eixoAR.loa}
                      onChange={(e) => handleFieldChange('eixo.eixoAR.loa', e.target.value)}
                      className="flex-1 bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 font-mono text-xs focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Eixo INT */}
              <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-200">
                <div className="font-bold text-slate-800 mb-2 border-b border-slate-200 pb-1 flex items-center justify-between">
                  <span>BASE ROLAMENTO EIXO INT.</span>
                  <span className="text-[10px] text-slate-500 font-medium">Intermediário</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-700 w-10">LA:</span>
                    <input
                      type="text"
                      placeholder="Medida LA (ex: 110.020)"
                      value={data.eixo.eixoInt.la}
                      onChange={(e) => handleFieldChange('eixo.eixoInt.la', e.target.value)}
                      className="flex-1 bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 font-mono text-xs focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-700 w-10">LOA:</span>
                    <input
                      type="text"
                      placeholder="Medida LOA (ex: 110.018)"
                      value={data.eixo.eixoInt.loa}
                      onChange={(e) => handleFieldChange('eixo.eixoInt.loa', e.target.value)}
                      className="flex-1 bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 font-mono text-xs focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Eixo INT 2 */}
              <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-200">
                <div className="font-bold text-slate-800 mb-2 border-b border-slate-200 pb-1 flex items-center justify-between">
                  <span>BASE ROLAMENTO EIXO INT.2</span>
                  <span className="text-[10px] text-slate-500 font-medium">Intermediário 2</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-700 w-10">LA:</span>
                    <input
                      type="text"
                      placeholder="Medida LA (ex: 110.020)"
                      value={data.eixo.eixoInt2?.la || ''}
                      onChange={(e) => handleFieldChange('eixo.eixoInt2.la', e.target.value)}
                      className="flex-1 bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 font-mono text-xs focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-700 w-10">LOA:</span>
                    <input
                      type="text"
                      placeholder="Medida LOA (ex: 110.018)"
                      value={data.eixo.eixoInt2?.loa || ''}
                      onChange={(e) => handleFieldChange('eixo.eixoInt2.loa', e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Eixo BR */}
              <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-200">
                <div className="font-bold text-slate-800 mb-2 border-b border-slate-200 pb-1 flex items-center justify-between">
                  <span>BASE ROLAMENTO EIXO B.R.</span>
                  <span className="text-[10px] text-slate-500 font-medium">Baixa Rotação</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-700 w-10">LA:</span>
                    <input
                      type="text"
                      placeholder="Medida LA (ex: 140.025)"
                      value={data.eixo.eixoBR.la}
                      onChange={(e) => handleFieldChange('eixo.eixoBR.la', e.target.value)}
                      className="flex-1 bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 font-mono text-xs focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-700 w-10">LOA:</span>
                    <input
                      type="text"
                      placeholder="Medida LOA (ex: 140.022)"
                      value={data.eixo.eixoBR.loa}
                      onChange={(e) => handleFieldChange('eixo.eixoBR.loa', e.target.value)}
                      className="flex-1 bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 font-mono text-xs focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Eixo Comentários */}
            <div className="px-3 pb-3">
              <label className="block text-[10px] uppercase font-bold text-slate-700 mb-1">
                COMENTÁRIOS DO EIXO:
              </label>
              <textarea
                rows={2}
                value={data.eixo.comentarios}
                onChange={(e) => handleFieldChange('eixo.comentarios', e.target.value)}
                placeholder="Observações sobre ovalização, conicidade ou desgaste nos eixos..."
                className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 text-xs focus:border-emerald-600 focus:outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Section 2: MANCAL (CARCAÇA) */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
            <div className="bg-slate-100 px-3 py-1.5 font-bold text-slate-800 flex items-center justify-between border-b border-slate-200">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                2. MANCAL - ALOJAMENTO DA CARCAÇA
              </span>
              <span className="text-[10px] text-slate-600 font-medium">Medida Encontrada vs Projeto</span>
            </div>

            <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Mancal AR */}
              <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-200">
                <div className="font-bold text-slate-800 mb-2 border-b border-slate-200 pb-1">
                  CARCAÇA EIXO A.R.
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <span className="text-[10px] text-slate-600 font-bold block">LA MEDIDA:</span>
                      <input
                        type="text"
                        placeholder="Ex: 150.01"
                        value={data.mancal.carcacaAR.laMedida}
                        onChange={(e) => handleFieldChange('mancal.carcacaAR.laMedida', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 font-mono text-xs focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-600 font-bold block">PROJETO:</span>
                      <input
                        type="text"
                        placeholder="Ex: 150 H7"
                        value={data.mancal.carcacaAR.laProjeto}
                        onChange={(e) => handleFieldChange('mancal.carcacaAR.laProjeto', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 font-mono text-xs focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <span className="text-[10px] text-slate-600 font-bold block">LOA MEDIDA:</span>
                      <input
                        type="text"
                        placeholder="Ex: 150.01"
                        value={data.mancal.carcacaAR.loaMedida}
                        onChange={(e) => handleFieldChange('mancal.carcacaAR.loaMedida', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 font-mono text-xs focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-600 font-bold block">PROJETO:</span>
                      <input
                        type="text"
                        placeholder="Ex: 150 H7"
                        value={data.mancal.carcacaAR.loaProjeto}
                        onChange={(e) => handleFieldChange('mancal.carcacaAR.loaProjeto', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 font-mono text-xs focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Mancal INT */}
              <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-200">
                <div className="font-bold text-slate-800 mb-2 border-b border-slate-200 pb-1">
                  CARCAÇA EIXO INT.
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <span className="text-[10px] text-slate-600 font-bold block">LA MEDIDA:</span>
                      <input
                        type="text"
                        placeholder="Ex: 180.01"
                        value={data.mancal.carcacaInt.laMedida}
                        onChange={(e) => handleFieldChange('mancal.carcacaInt.laMedida', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 font-mono text-xs focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-600 font-bold block">PROJETO:</span>
                      <input
                        type="text"
                        placeholder="Ex: 180 H7"
                        value={data.mancal.carcacaInt.laProjeto}
                        onChange={(e) => handleFieldChange('mancal.carcacaInt.laProjeto', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 font-mono text-xs focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <span className="text-[10px] text-slate-600 font-bold block">LOA MEDIDA:</span>
                      <input
                        type="text"
                        placeholder="Ex: 180.02"
                        value={data.mancal.carcacaInt.loaMedida}
                        onChange={(e) => handleFieldChange('mancal.carcacaInt.loaMedida', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 font-mono text-xs focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-600 font-bold block">PROJETO:</span>
                      <input
                        type="text"
                        placeholder="Ex: 180 H7"
                        value={data.mancal.carcacaInt.loaProjeto}
                        onChange={(e) => handleFieldChange('mancal.carcacaInt.loaProjeto', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 font-mono text-xs focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Mancal INT 2 */}
              <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-200">
                <div className="font-bold text-slate-800 mb-2 border-b border-slate-200 pb-1 flex items-center justify-between">
                  <span>CARCAÇA EIXO INT.2</span>
                  <span className="text-[10px] text-slate-500 font-medium">Alojamento</span>
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <span className="text-[10px] text-slate-600 font-bold block">LA MEDIDA:</span>
                      <input
                        type="text"
                        placeholder="Ex: 180.01"
                        value={data.mancal.carcacaInt2?.laMedida || ''}
                        onChange={(e) => handleFieldChange('mancal.carcacaInt2.laMedida', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 font-mono text-xs focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-600 font-bold block">PROJETO:</span>
                      <input
                        type="text"
                        placeholder="Ex: 180 H7"
                        value={data.mancal.carcacaInt2?.laProjeto || ''}
                        onChange={(e) => handleFieldChange('mancal.carcacaInt2.laProjeto', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 font-mono text-xs focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <span className="text-[10px] text-slate-600 font-bold block">LOA MEDIDA:</span>
                      <input
                        type="text"
                        placeholder="Ex: 180.02"
                        value={data.mancal.carcacaInt2?.loaMedida || ''}
                        onChange={(e) => handleFieldChange('mancal.carcacaInt2.loaMedida', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 font-mono text-xs focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-600 font-bold block">PROJETO:</span>
                      <input
                        type="text"
                        placeholder="Ex: 180 H7"
                        value={data.mancal.carcacaInt2?.loaProjeto || ''}
                        onChange={(e) => handleFieldChange('mancal.carcacaInt2.loaProjeto', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 font-mono text-xs focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Mancal BR */}
              <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-200">
                <div className="font-bold text-slate-800 mb-2 border-b border-slate-200 pb-1">
                  CARCAÇA EIXO B.R.
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <span className="text-[10px] text-slate-600 font-bold block">LA MEDIDA:</span>
                      <input
                        type="text"
                        placeholder="Ex: 210.02"
                        value={data.mancal.carcacaBR.laMedida}
                        onChange={(e) => handleFieldChange('mancal.carcacaBR.laMedida', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 font-mono text-xs focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-600 font-bold block">PROJETO:</span>
                      <input
                        type="text"
                        placeholder="Ex: 210 H7"
                        value={data.mancal.carcacaBR.laProjeto}
                        onChange={(e) => handleFieldChange('mancal.carcacaBR.laProjeto', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 font-mono text-xs focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <span className="text-[10px] text-slate-600 font-bold block">LOA MEDIDA:</span>
                      <input
                        type="text"
                        placeholder="Ex: 210.02"
                        value={data.mancal.carcacaBR.loaMedida}
                        onChange={(e) => handleFieldChange('mancal.carcacaBR.loaMedida', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 font-mono text-xs focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-600 font-bold block">PROJETO:</span>
                      <input
                        type="text"
                        placeholder="Ex: 210 H7"
                        value={data.mancal.carcacaBR.loaProjeto}
                        onChange={(e) => handleFieldChange('mancal.carcacaBR.loaProjeto', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 font-mono text-xs focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mancal Comentários */}
            <div className="px-3 pb-3">
              <label className="block text-[10px] uppercase font-bold text-slate-700 mb-1">
                COMENTÁRIOS DO MANCAL / CARCAÇA:
              </label>
              <textarea
                rows={2}
                value={data.mancal.comentarios}
                onChange={(e) => handleFieldChange('mancal.comentarios', e.target.value)}
                placeholder="Observações sobre desgaste nos mancais, marcas de giro de capa ou folgas..."
                className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 text-xs focus:border-emerald-600 focus:outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Section 3: ROLAMENTOS */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
            <div className="bg-slate-100 px-3 py-1.5 font-bold text-slate-800 border-b border-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                3. ROLAMENTOS (NUMERAÇÃO E FOLGA RADIAL)
              </span>
            </div>

            <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Eixo AR */}
              <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-200">
                <div className="font-bold text-slate-800 mb-2 border-b border-slate-200 pb-1">
                  EIXO A.R.
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <span className="text-[10px] text-slate-600 font-bold block">LA NUMERAÇÃO:</span>
                      <input
                        type="text"
                        placeholder="Ex: 22217 EK"
                        value={data.rolamentos.eixoAR.laNum}
                        onChange={(e) => handleFieldChange('rolamentos.eixoAR.laNum', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 font-mono text-xs focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-600 font-bold block">LA FOLGA:</span>
                      <input
                        type="text"
                        placeholder="Ex: 0,065 mm"
                        value={data.rolamentos.eixoAR.laFolga}
                        onChange={(e) => handleFieldChange('rolamentos.eixoAR.laFolga', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 font-mono text-xs focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <span className="text-[10px] text-slate-600 font-bold block">LOA NUMERAÇÃO:</span>
                      <input
                        type="text"
                        placeholder="Ex: 22217 EK"
                        value={data.rolamentos.eixoAR.loaNum}
                        onChange={(e) => handleFieldChange('rolamentos.eixoAR.loaNum', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 font-mono text-xs focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-600 font-bold block">LOA FOLGA:</span>
                      <input
                        type="text"
                        placeholder="Ex: 0,060 mm"
                        value={data.rolamentos.eixoAR.loaFolga}
                        onChange={(e) => handleFieldChange('rolamentos.eixoAR.loaFolga', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 font-mono text-xs focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Eixo Intermediário */}
              <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-200">
                <div className="font-bold text-slate-800 mb-2 border-b border-slate-200 pb-1">
                  EIXO INTERMEDIÁRIO
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <span className="text-[10px] text-slate-600 font-bold block">LA NUMERAÇÃO:</span>
                      <input
                        type="text"
                        placeholder="Ex: 22322 CC"
                        value={data.rolamentos.eixoInt.laNum}
                        onChange={(e) => handleFieldChange('rolamentos.eixoInt.laNum', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 font-mono text-xs focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-600 font-bold block">LA FOLGA:</span>
                      <input
                        type="text"
                        placeholder="Ex: 0,090 mm"
                        value={data.rolamentos.eixoInt.laFolga}
                        onChange={(e) => handleFieldChange('rolamentos.eixoInt.laFolga', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 font-mono text-xs focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <span className="text-[10px] text-slate-600 font-bold block">LOA NUMERAÇÃO:</span>
                      <input
                        type="text"
                        placeholder="Ex: 22322 CC"
                        value={data.rolamentos.eixoInt.loaNum}
                        onChange={(e) => handleFieldChange('rolamentos.eixoInt.loaNum', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 font-mono text-xs focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-600 font-bold block">LOA FOLGA:</span>
                      <input
                        type="text"
                        placeholder="Ex: 0,085 mm"
                        value={data.rolamentos.eixoInt.loaFolga}
                        onChange={(e) => handleFieldChange('rolamentos.eixoInt.loaFolga', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 font-mono text-xs focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Rolamentos INT 2 */}
              <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-200">
                <div className="font-bold text-slate-800 mb-2 border-b border-slate-200 pb-1 flex items-center justify-between">
                  <span>EIXO INTERMEDIÁRIO 2</span>
                  <span className="text-[10px] text-slate-500 font-medium">Folga Radial</span>
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <span className="text-[10px] text-slate-600 font-bold block">LA NUMERAÇÃO:</span>
                      <input
                        type="text"
                        placeholder="Ex: 22322 CC"
                        value={data.rolamentos.eixoInt2?.laNum || ''}
                        onChange={(e) => handleFieldChange('rolamentos.eixoInt2.laNum', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 font-mono text-xs focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-600 font-bold block">LA FOLGA:</span>
                      <input
                        type="text"
                        placeholder="Ex: 0,090 mm"
                        value={data.rolamentos.eixoInt2?.laFolga || ''}
                        onChange={(e) => handleFieldChange('rolamentos.eixoInt2.laFolga', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 font-mono text-xs focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <span className="text-[10px] text-slate-600 font-bold block">LOA NUMERAÇÃO:</span>
                      <input
                        type="text"
                        placeholder="Ex: 22322 CC"
                        value={data.rolamentos.eixoInt2?.loaNum || ''}
                        onChange={(e) => handleFieldChange('rolamentos.eixoInt2.loaNum', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 font-mono text-xs focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-600 font-bold block">LOA FOLGA:</span>
                      <input
                        type="text"
                        placeholder="Ex: 0,085 mm"
                        value={data.rolamentos.eixoInt2?.loaFolga || ''}
                        onChange={(e) => handleFieldChange('rolamentos.eixoInt2.loaFolga', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 font-mono text-xs focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Eixo BR */}
              <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-200">
                <div className="font-bold text-slate-800 mb-2 border-b border-slate-200 pb-1">
                  EIXO B.R.
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <span className="text-[10px] text-slate-600 font-bold block">LA NUMERAÇÃO:</span>
                      <input
                        type="text"
                        placeholder="Ex: 23128 CC"
                        value={data.rolamentos.eixoBR.laNum}
                        onChange={(e) => handleFieldChange('rolamentos.eixoBR.laNum', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 font-mono text-xs focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-600 font-bold block">LA FOLGA:</span>
                      <input
                        type="text"
                        placeholder="Ex: 0,110 mm"
                        value={data.rolamentos.eixoBR.laFolga}
                        onChange={(e) => handleFieldChange('rolamentos.eixoBR.laFolga', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 font-mono text-xs focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <span className="text-[10px] text-slate-600 font-bold block">LOA NUMERAÇÃO:</span>
                      <input
                        type="text"
                        placeholder="Ex: 23128 CC"
                        value={data.rolamentos.eixoBR.loaNum}
                        onChange={(e) => handleFieldChange('rolamentos.eixoBR.loaNum', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 font-mono text-xs focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-600 font-bold block">LOA FOLGA:</span>
                      <input
                        type="text"
                        placeholder="Ex: 0,115 mm"
                        value={data.rolamentos.eixoBR.loaFolga}
                        onChange={(e) => handleFieldChange('rolamentos.eixoBR.loaFolga', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 font-mono text-xs focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4 & 5: ENGRENAMENTO E CARCAÇA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white p-3 shadow-xs">
              <div className="font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                ENGRENAMENTO
              </div>
              <textarea
                rows={3}
                value={data.engrenamentoComentarios}
                onChange={(e) => handleFieldChange('engrenamentoComentarios', e.target.value)}
                placeholder="Comentários sobre marcas de contato, dentes lascados, pittings..."
                className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 text-xs focus:border-emerald-600 focus:outline-none placeholder:text-slate-400"
              />
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white p-3 shadow-xs">
              <div className="font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                CARCAÇA
              </div>
              <textarea
                rows={3}
                value={data.carcacaComentarios}
                onChange={(e) => handleFieldChange('carcacaComentarios', e.target.value)}
                placeholder="Comentários sobre trincas, limpeza interna, vedação..."
                className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 text-xs focus:border-emerald-600 focus:outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Section 6: FOLGAS AXIAIS */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
            <div className="bg-slate-100 px-3 py-1.5 font-bold text-slate-800 border-b border-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                6. FOLGAS AXIAIS
              </span>
              <span className="text-[10px] text-slate-600 font-medium">Medições com relógio comparador</span>
            </div>

            <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Eixo AR */}
              <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-200">
                <div className="font-bold text-slate-800 mb-1.5 border-b border-slate-200 pb-1">
                  EIXO A.R.
                </div>
                <div className="space-y-1.5">
                  <div>
                    <span className="text-[10px] text-slate-600 font-bold block">REFERÊNCIA:</span>
                    <input
                      type="text"
                      placeholder="Ex: 0,10 - 0,18 mm"
                      value={data.folgasAxiais.eixoAR.ref}
                      onChange={(e) => handleFieldChange('folgasAxiais.eixoAR.ref', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 font-mono text-xs focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <span className="text-[10px] text-slate-600 font-bold block">MEDIDA 1:</span>
                      <input
                        type="text"
                        placeholder="Ex: 0,14 mm"
                        value={data.folgasAxiais.eixoAR.med1}
                        onChange={(e) => handleFieldChange('folgasAxiais.eixoAR.med1', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 font-mono text-xs focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-600 font-bold block">MEDIDA 2:</span>
                      <input
                        type="text"
                        placeholder="Ex: 0,15 mm"
                        value={data.folgasAxiais.eixoAR.med2}
                        onChange={(e) => handleFieldChange('folgasAxiais.eixoAR.med2', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 font-mono text-xs focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Eixo INT */}
              <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-200">
                <div className="font-bold text-slate-800 mb-1.5 border-b border-slate-200 pb-1">
                  EIXO INTERMEDIÁRIO
                </div>
                <div className="space-y-1.5">
                  <div>
                    <span className="text-[10px] text-slate-600 font-bold block">REFERÊNCIA:</span>
                    <input
                      type="text"
                      placeholder="Ex: 0,12 - 0,22 mm"
                      value={data.folgasAxiais.eixoInt.ref}
                      onChange={(e) => handleFieldChange('folgasAxiais.eixoInt.ref', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 font-mono text-xs focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <span className="text-[10px] text-slate-600 font-bold block">MEDIDA 1:</span>
                      <input
                        type="text"
                        placeholder="Ex: 0,18 mm"
                        value={data.folgasAxiais.eixoInt.med1}
                        onChange={(e) => handleFieldChange('folgasAxiais.eixoInt.med1', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 font-mono text-xs focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-600 font-bold block">MEDIDA 2:</span>
                      <input
                        type="text"
                        placeholder="Ex: 0,17 mm"
                        value={data.folgasAxiais.eixoInt.med2}
                        onChange={(e) => handleFieldChange('folgasAxiais.eixoInt.med2', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 font-mono text-xs focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Folgas Axiais INT 2 */}
              <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-200">
                <div className="font-bold text-slate-800 mb-1.5 border-b border-slate-200 pb-1 flex items-center justify-between">
                  <span>EIXO INTERMEDIÁRIO 2</span>
                  <span className="text-[10px] text-slate-500 font-medium">Relógio Comp.</span>
                </div>
                <div className="space-y-1.5">
                  <div>
                    <span className="text-[10px] text-slate-600 font-bold block">REFERÊNCIA:</span>
                    <input
                      type="text"
                      placeholder="Ex: 0,12 - 0,22 mm"
                      value={data.folgasAxiais.eixoInt2?.ref || ''}
                      onChange={(e) => handleFieldChange('folgasAxiais.eixoInt2.ref', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 font-mono text-xs focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <span className="text-[10px] text-slate-600 font-bold block">MEDIDA 1:</span>
                      <input
                        type="text"
                        placeholder="Ex: 0,18 mm"
                        value={data.folgasAxiais.eixoInt2?.med1 || ''}
                        onChange={(e) => handleFieldChange('folgasAxiais.eixoInt2.med1', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 font-mono text-xs focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-600 font-bold block">MEDIDA 2:</span>
                      <input
                        type="text"
                        placeholder="Ex: 0,17 mm"
                        value={data.folgasAxiais.eixoInt2?.med2 || ''}
                        onChange={(e) => handleFieldChange('folgasAxiais.eixoInt2.med2', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 font-mono text-xs focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Eixo BR */}
              <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-200">
                <div className="font-bold text-slate-800 mb-1.5 border-b border-slate-200 pb-1">
                  EIXO B.R.
                </div>
                <div className="space-y-1.5">
                  <div>
                    <span className="text-[10px] text-slate-600 font-bold block">REFERÊNCIA:</span>
                    <input
                      type="text"
                      placeholder="Ex: 0,15 - 0,25 mm"
                      value={data.folgasAxiais.eixoBR.ref}
                      onChange={(e) => handleFieldChange('folgasAxiais.eixoBR.ref', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 font-mono text-xs focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <span className="text-[10px] text-slate-600 font-bold block">MEDIDA 1:</span>
                      <input
                        type="text"
                        placeholder="Ex: 0,20 mm"
                        value={data.folgasAxiais.eixoBR.med1}
                        onChange={(e) => handleFieldChange('folgasAxiais.eixoBR.med1', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 font-mono text-xs focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-600 font-bold block">MEDIDA 2:</span>
                      <input
                        type="text"
                        placeholder="Ex: 0,21 mm"
                        value={data.folgasAxiais.eixoBR.med2}
                        onChange={(e) => handleFieldChange('folgasAxiais.eixoBR.med2', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 font-mono text-xs focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 7: SERVIÇOS E COMENTÁRIOS ADICIONAIS */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white p-3 shadow-xs">
            <div className="font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              7. SERVIÇOS E COMENTÁRIOS ADICIONAIS
            </div>
            <textarea
              rows={3}
              value={data.servicosComentariosAdicionais}
              onChange={(e) => handleFieldChange('servicosComentariosAdicionais', e.target.value)}
              placeholder="Registro de serviços especiais, usinagem de eixos, calços ou observações de montagem..."
              className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 text-xs focus:border-emerald-600 focus:outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-3 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-600 font-medium flex items-center gap-2">
            <CheckCircle2 className={`w-4 h-4 ${data.enabled ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span>
              {data.enabled 
                ? 'Esta planilha será gerada automaticamente no final do PDF.' 
                : 'Planilha em rascunho (marque a caixa acima para incluir no PDF).'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-300 transition"
            >
              Concluir e Voltar
            </button>
            <button
              type="button"
              onClick={() => {
                handleToggleEnabled(true);
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Salvar & Incluir no PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
