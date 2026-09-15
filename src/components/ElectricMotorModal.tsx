import React, { useState } from 'react';
import { 
  X, 
  Zap, 
  CheckCircle2, 
  RotateCcw, 
  Layers, 
  Activity, 
  Thermometer, 
  Gauge, 
  Wrench, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { ElectricMotorSheet } from '../types';

interface ElectricMotorModalProps {
  isOpen: boolean;
  onClose: () => void;
  sheet: ElectricMotorSheet;
  onSave: (sheet: ElectricMotorSheet) => void;
  reportTag: string;
  reportOs: string;
}

export const ElectricMotorModal: React.FC<ElectricMotorModalProps> = ({
  isOpen,
  onClose,
  sheet,
  onSave,
  reportTag,
  reportOs,
}) => {
  const [activeTab, setActiveTab] = useState<'ELETRICA' | 'MECANICA'>('ELETRICA');
  const [formData, setFormData] = useState<ElectricMotorSheet>(() => {
    return {
      ...sheet,
      tag: sheet.tag || reportTag || '',
      os: sheet.os || reportOs || '',
      data: sheet.data || new Date().toISOString().split('T')[0],
    };
  });

  if (!isOpen) return null;

  // Auto-calculation of Desequilíbrio Ôhmico (DR)
  const calculateDR = (rsStr: string, stStr: string, trStr: string) => {
    const rs = parseFloat(rsStr.replace(',', '.'));
    const st = parseFloat(stStr.replace(',', '.'));
    const tr = parseFloat(trStr.replace(',', '.'));

    if (!isNaN(rs) && !isNaN(st) && !isNaN(tr) && rs > 0 && st > 0 && tr > 0) {
      const vals = [rs, st, tr];
      const maxVal = Math.max(...vals);
      const minVal = Math.min(...vals);
      if (minVal > 0) {
        const dr = ((maxVal - minVal) / minVal) * 100;
        return dr.toFixed(2);
      }
    }
    return '';
  };

  const handleUpdateRS = (val: string) => {
    const nextDR = calculateDR(val, formData.resistenciaST, formData.resistenciaTR);
    setFormData((prev) => ({
      ...prev,
      resistenciaRS: val,
      desequilibrioPercent: nextDR || prev.desequilibrioPercent,
    }));
  };

  const handleUpdateST = (val: string) => {
    const nextDR = calculateDR(formData.resistenciaRS, val, formData.resistenciaTR);
    setFormData((prev) => ({
      ...prev,
      resistenciaST: val,
      desequilibrioPercent: nextDR || prev.desequilibrioPercent,
    }));
  };

  const handleUpdateTR = (val: string) => {
    const nextDR = calculateDR(formData.resistenciaRS, formData.resistenciaST, val);
    setFormData((prev) => ({
      ...prev,
      resistenciaTR: val,
      desequilibrioPercent: nextDR || prev.desequilibrioPercent,
    }));
  };

  // Auto-calculation of Isolação (Índice de Absorção e Polarização)
  const calculateIndex = (numStr: string, denStr: string) => {
    const num = parseFloat(numStr.replace(',', '.'));
    const den = parseFloat(denStr.replace(',', '.'));
    if (!isNaN(num) && !isNaN(den) && den > 0) {
      return (num / den).toFixed(2);
    }
    return '';
  };

  const handleUpdateIsolacaoAntes = (field: keyof typeof formData.isolacaoAntes, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev.isolacaoAntes, [field]: value };
      if (field === 'res30s' || field === 'res1min') {
        const iad = calculateIndex(updated.res1min, updated.res30s);
        if (iad) updated.indiceAbsorcao = iad;
      }
      if (field === 'res1min' || field === 'res10min') {
        const ip = calculateIndex(updated.res10min, updated.res1min);
        if (ip) updated.indicePolarizacao = ip;
      }
      return { ...prev, isolacaoAntes: updated };
    });
  };

  const handleUpdateIsolacaoDepois = (field: keyof typeof formData.isolacaoDepois, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev.isolacaoDepois, [field]: value };
      if (field === 'res30s' || field === 'res1min') {
        const iad = calculateIndex(updated.res1min, updated.res30s);
        if (iad) updated.indiceAbsorcao = iad;
      }
      if (field === 'res1min' || field === 'res10min') {
        const ip = calculateIndex(updated.res10min, updated.res1min);
        if (ip) updated.indicePolarizacao = ip;
      }
      return { ...prev, isolacaoDepois: updated };
    });
  };

  const handleSaveAndClose = () => {
    onSave(formData);
    onClose();
  };

  const drNum = parseFloat(formData.desequilibrioPercent.replace(',', '.'));
  const isDRConforme = !isNaN(drNum) ? drNum <= 3 : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-5xl bg-neutral-950 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-black px-4 sm:px-6 py-3.5 border-b border-neutral-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-amber-400 text-sm">KINROSS</span>
                <span className="text-zinc-500 text-xs font-mono">Paracatu</span>
                <span className="text-zinc-600">|</span>
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  MANUTENÇÃO DE MOTORES ELÉTRICOS
                </h3>
              </div>
              <p className="text-xs text-zinc-400">
                Laudo institucional de ensaios elétricos estáticos e verificação dimensional de folgas mecânicas.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
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

        {/* Tab Navigation */}
        <div className="bg-black/90 border-b border-neutral-800 px-4 sm:px-6 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('ELETRICA')}
            className={`py-2.5 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'ELETRICA'
                ? 'border-amber-500 text-amber-300 bg-amber-950/20'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Activity className="w-4 h-4 text-amber-400" />
            <span>Página 1: Testes Iniciais & Elétricos</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('MECANICA')}
            className={`py-2.5 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'MECANICA'
                ? 'border-amber-500 text-amber-300 bg-amber-950/20'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Wrench className="w-4 h-4 text-amber-400" />
            <span>Página 2: Folgas Mecânicas & Atividade</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-zinc-200 text-xs">
          {activeTab === 'ELETRICA' ? (
            <>
              {/* Seção: TESTES INICIAIS / DADOS DE PLACA */}
              <div className="bg-black rounded-xl border border-neutral-800 p-4 space-y-3">
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    1. Testes Iniciais & Dados de Placa
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">PDF Pág. 1</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">Data:</label>
                    <input
                      type="date"
                      value={formData.data}
                      onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">OS:</label>
                    <input
                      type="text"
                      value={formData.os}
                      onChange={(e) => setFormData({ ...formData, os: e.target.value })}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-amber-300 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">TAG:</label>
                    <input
                      type="text"
                      value={formData.tag}
                      onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-amber-300 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">Equipamento:</label>
                    <input
                      type="text"
                      placeholder="Ex: Motor Acionamento"
                      value={formData.equipamento}
                      onChange={(e) => setFormData({ ...formData, equipamento: e.target.value })}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">Modelo / Carcaça:</label>
                    <input
                      type="text"
                      placeholder="Ex: W22 355 M/L"
                      value={formData.modeloCarcaca}
                      onChange={(e) => setFormData({ ...formData, modeloCarcaca: e.target.value })}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">Potência (CV):</label>
                    <input
                      type="text"
                      placeholder="Ex: 500 CV"
                      value={formData.potenciaCv}
                      onChange={(e) => setFormData({ ...formData, potenciaCv: e.target.value })}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">Polos:</label>
                    <input
                      type="text"
                      placeholder="Ex: 4"
                      value={formData.polos}
                      onChange={(e) => setFormData({ ...formData, polos: e.target.value })}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">Velocidade (RPM):</label>
                    <input
                      type="text"
                      placeholder="Ex: 1785 RPM"
                      value={formData.velocidadeRpm}
                      onChange={(e) => setFormData({ ...formData, velocidadeRpm: e.target.value })}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">Tensão (V):</label>
                    <input
                      type="text"
                      placeholder="Ex: 4160 V"
                      value={formData.tensaoV}
                      onChange={(e) => setFormData({ ...formData, tensaoV: e.target.value })}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">Corrente (A):</label>
                    <input
                      type="text"
                      placeholder="Ex: 62 A"
                      value={formData.correnteA}
                      onChange={(e) => setFormData({ ...formData, correnteA: e.target.value })}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">Ip/In:</label>
                    <input
                      type="text"
                      placeholder="Ex: 6.8"
                      value={formData.ipIn}
                      onChange={(e) => setFormData({ ...formData, ipIn: e.target.value })}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">Nº Patrimônio:</label>
                    <input
                      type="text"
                      value={formData.numPatrimonio}
                      onChange={(e) => setFormData({ ...formData, numPatrimonio: e.target.value })}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">Nº Série:</label>
                    <input
                      type="text"
                      value={formData.numSerie}
                      onChange={(e) => setFormData({ ...formData, numSerie: e.target.value })}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">Forma Construtiva:</label>
                    <input
                      type="text"
                      placeholder="Ex: B3D / B35"
                      value={formData.formaConstrutiva}
                      onChange={(e) => setFormData({ ...formData, formaConstrutiva: e.target.value })}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">Classe Isolação:</label>
                    <input
                      type="text"
                      placeholder="Ex: F / H"
                      value={formData.classeIsolacao}
                      onChange={(e) => setFormData({ ...formData, classeIsolacao: e.target.value })}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">Temp. Ambiente (°C):</label>
                    <input
                      type="text"
                      placeholder="Ex: 25 °C"
                      value={formData.tempAmbienteC}
                      onChange={(e) => setFormData({ ...formData, tempAmbienteC: e.target.value })}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">Umidade Relativa (%):</label>
                    <input
                      type="text"
                      placeholder="Ex: 55 %"
                      value={formData.umidadeRelativaPercent}
                      onChange={(e) => setFormData({ ...formData, umidadeRelativaPercent: e.target.value })}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Seção: TESTES ESTÁTICOS - RESISTÊNCIA ÔHMICA & DESEQUILÍBRIO (DR) */}
              <div className="bg-black rounded-xl border border-neutral-800 p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" />
                    2. Testes Estáticos - Resistência Ôhmica & Desequilíbrio (DR)
                  </span>

                  {isDRConforme !== null && (
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                      isDRConforme 
                        ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-400' 
                        : 'bg-rose-950/70 border-rose-500/50 text-rose-400'
                    }`}>
                      {isDRConforme ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      {isDRConforme ? 'DR Conforme (≤ 3%)' : 'DR Não Conforme (> 3%)'}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Tabela de Resistências */}
                  <div className="border border-neutral-800 rounded-lg overflow-hidden bg-neutral-950">
                    <table className="w-full text-xs">
                      <thead className="bg-neutral-900 text-zinc-400 text-[10px] uppercase">
                        <tr>
                          <th className="py-2 px-3 text-left">Fases</th>
                          <th className="py-2 px-3 text-left">Resistência Ôhmica (Ω)</th>
                          <th className="py-2 px-3 text-left">Condição</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800 font-mono">
                        <tr>
                          <td className="py-2 px-3 font-bold text-amber-400">R/S</td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              placeholder="0.000"
                              value={formData.resistenciaRS}
                              onChange={(e) => handleUpdateRS(e.target.value)}
                              className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              placeholder="Ex: Conforme"
                              value={formData.condicaoRS_ST_TR}
                              onChange={(e) => setFormData({ ...formData, condicaoRS_ST_TR: e.target.value })}
                              className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-zinc-300 font-sans"
                            />
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 font-bold text-amber-400">S/T</td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              placeholder="0.000"
                              value={formData.resistenciaST}
                              onChange={(e) => handleUpdateST(e.target.value)}
                              className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white"
                            />
                          </td>
                          <td className="py-2 px-3 text-zinc-500 font-sans text-[11px] italic">
                            Mesma medição
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 font-bold text-amber-400">T/R</td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              placeholder="0.000"
                              value={formData.resistenciaTR}
                              onChange={(e) => handleUpdateTR(e.target.value)}
                              className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white"
                            />
                          </td>
                          <td className="py-2 px-3 text-zinc-500 font-sans text-[11px] italic">
                            Mesma medição
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Cálculo do DR e Fórmula */}
                  <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 space-y-2">
                    <div className="text-[11px] font-bold text-zinc-300 uppercase flex items-center justify-between">
                      <span>Desequilíbrio de Resistências Ôhmica (DR)</span>
                      <span className="text-amber-400 font-mono">Limite: ≤ 3%</span>
                    </div>

                    <div className="bg-neutral-900 rounded p-2 text-[11px] text-zinc-300 font-mono flex items-center justify-center gap-2 border border-neutral-800">
                      <span>DR =</span>
                      <div className="inline-flex flex-col items-center">
                        <span className="border-b border-zinc-400 px-1">Resistência maior - Resistência menor</span>
                        <span>Resistência menor</span>
                      </div>
                      <span>× 100</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">Percentual Obtido:</label>
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            placeholder="0.00"
                            value={formData.desequilibrioPercent}
                            onChange={(e) => setFormData({ ...formData, desequilibrioPercent: e.target.value })}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs font-mono font-bold text-amber-300"
                          />
                          <span className="text-zinc-400 font-bold">%</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">Limite Máximo:</label>
                        <input
                          type="text"
                          readOnly
                          value="≤ 3%"
                          className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-xs text-zinc-400 font-mono"
                        />
                      </div>
                    </div>
                    <p className="text-[10px] text-zinc-400 italic">
                      * O desequilíbrio de resistência (DR) não deverá ser superior a 3%, conforme equação institucional Kinross.
                    </p>
                  </div>
                </div>
              </div>

              {/* Seção: SENSORES (ANTES & DEPOIS) */}
              <div className="bg-black rounded-xl border border-neutral-800 p-4 space-y-3">
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Thermometer className="w-3.5 h-3.5" />
                    3. Sensores Térmicos (Antes & Depois)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Sensores Antes */}
                  <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 space-y-2">
                    <div className="text-[11px] font-bold text-amber-300 uppercase border-b border-neutral-800 pb-1 flex items-center justify-between">
                      <span>SENSORES (ANTES)</span>
                      <input
                        type="text"
                        placeholder="Tipo (ex: PT-100)"
                        value={formData.sensoresAntes.tipo}
                        onChange={(e) => setFormData({
                          ...formData,
                          sensoresAntes: { ...formData.sensoresAntes, tipo: e.target.value }
                        })}
                        className="bg-neutral-900 border border-neutral-700 rounded px-2 py-0.5 text-[11px] text-white w-28"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="block text-[10px] text-zinc-400">Estator (qtd):</label>
                        <input
                          type="text"
                          placeholder="Ex: 06"
                          value={formData.sensoresAntes.estatorQtd}
                          onChange={(e) => setFormData({
                            ...formData,
                            sensoresAntes: { ...formData.sensoresAntes, estatorQtd: e.target.value }
                          })}
                          className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-400">Status Estator:</label>
                        <input
                          type="text"
                          placeholder="Ex: OK / Bom"
                          value={formData.sensoresAntes.estatorStatus}
                          onChange={(e) => setFormData({
                            ...formData,
                            sensoresAntes: { ...formData.sensoresAntes, estatorStatus: e.target.value }
                          })}
                          className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-400">Mancal L.A. (qtd):</label>
                        <input
                          type="text"
                          placeholder="Ex: 01"
                          value={formData.sensoresAntes.mancalLAQtd}
                          onChange={(e) => setFormData({
                            ...formData,
                            sensoresAntes: { ...formData.sensoresAntes, mancalLAQtd: e.target.value }
                          })}
                          className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-400">Status Mancal L.A.:</label>
                        <input
                          type="text"
                          placeholder="Ex: OK"
                          value={formData.sensoresAntes.mancalLAStatus}
                          onChange={(e) => setFormData({
                            ...formData,
                            sensoresAntes: { ...formData.sensoresAntes, mancalLAStatus: e.target.value }
                          })}
                          className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-400">Mancal L.O.A. (qtd):</label>
                        <input
                          type="text"
                          placeholder="Ex: 01"
                          value={formData.sensoresAntes.mancalLOAQtd}
                          onChange={(e) => setFormData({
                            ...formData,
                            sensoresAntes: { ...formData.sensoresAntes, mancalLOAQtd: e.target.value }
                          })}
                          className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-400">Status Mancal L.O.A.:</label>
                        <input
                          type="text"
                          placeholder="Ex: OK"
                          value={formData.sensoresAntes.mancalLOAStatus}
                          onChange={(e) => setFormData({
                            ...formData,
                            sensoresAntes: { ...formData.sensoresAntes, mancalLOAStatus: e.target.value }
                          })}
                          className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sensores Depois */}
                  <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 space-y-2">
                    <div className="text-[11px] font-bold text-amber-300 uppercase border-b border-neutral-800 pb-1 flex items-center justify-between">
                      <span>SENSORES (DEPOIS)</span>
                      <input
                        type="text"
                        placeholder="Tipo (ex: PT-100)"
                        value={formData.sensoresDepois.tipo}
                        onChange={(e) => setFormData({
                          ...formData,
                          sensoresDepois: { ...formData.sensoresDepois, tipo: e.target.value }
                        })}
                        className="bg-neutral-900 border border-neutral-700 rounded px-2 py-0.5 text-[11px] text-white w-28"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="block text-[10px] text-zinc-400">Estator (qtd):</label>
                        <input
                          type="text"
                          placeholder="Ex: 06"
                          value={formData.sensoresDepois.estatorQtd}
                          onChange={(e) => setFormData({
                            ...formData,
                            sensoresDepois: { ...formData.sensoresDepois, estatorQtd: e.target.value }
                          })}
                          className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-400">Status Estator:</label>
                        <input
                          type="text"
                          placeholder="Ex: OK / Novo"
                          value={formData.sensoresDepois.estatorStatus}
                          onChange={(e) => setFormData({
                            ...formData,
                            sensoresDepois: { ...formData.sensoresDepois, estatorStatus: e.target.value }
                          })}
                          className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-400">Mancal L.A. (qtd):</label>
                        <input
                          type="text"
                          placeholder="Ex: 01"
                          value={formData.sensoresDepois.mancalLAQtd}
                          onChange={(e) => setFormData({
                            ...formData,
                            sensoresDepois: { ...formData.sensoresDepois, mancalLAQtd: e.target.value }
                          })}
                          className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-400">Status Mancal L.A.:</label>
                        <input
                          type="text"
                          placeholder="Ex: OK"
                          value={formData.sensoresDepois.mancalLAStatus}
                          onChange={(e) => setFormData({
                            ...formData,
                            sensoresDepois: { ...formData.sensoresDepois, mancalLAStatus: e.target.value }
                          })}
                          className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-400">Mancal L.O.A. (qtd):</label>
                        <input
                          type="text"
                          placeholder="Ex: 01"
                          value={formData.sensoresDepois.mancalLOAQtd}
                          onChange={(e) => setFormData({
                            ...formData,
                            sensoresDepois: { ...formData.sensoresDepois, mancalLOAQtd: e.target.value }
                          })}
                          className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-400">Status Mancal L.O.A.:</label>
                        <input
                          type="text"
                          placeholder="Ex: OK"
                          value={formData.sensoresDepois.mancalLOAStatus}
                          onChange={(e) => setFormData({
                            ...formData,
                            sensoresDepois: { ...formData.sensoresDepois, mancalLOAStatus: e.target.value }
                          })}
                          className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-zinc-400 italic">
                  * Como padrão, mínimo 01 sensor para enrolamento, ideal 03, ótimo 06, sendo dois por fase e 02 sensores por mancal.
                </p>
              </div>

              {/* Seção: RESISTÊNCIA DE ISOLAÇÃO & ÍNDICES (ANTES & DEPOIS) */}
              <div className="bg-black rounded-xl border border-neutral-800 p-4 space-y-3">
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5" />
                    4. Resistência de Isolação & Índices (Antes & Depois)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Isolação Antes */}
                  <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 space-y-2">
                    <div className="text-[11px] font-bold text-amber-300 uppercase border-b border-neutral-800 pb-1 flex items-center justify-between">
                      <span>RESISTÊNCIA DE ISOLAÇÃO (ANTES)</span>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-zinc-400">Tensão:</span>
                        <input
                          type="text"
                          placeholder="1000 Vcc"
                          value={formData.isolacaoAntes.tensaoAplicadaVcc}
                          onChange={(e) => handleUpdateIsolacaoAntes('tensaoAplicadaVcc', e.target.value)}
                          className="bg-neutral-900 border border-neutral-700 rounded px-1.5 py-0.5 text-[11px] text-white w-20 text-center font-mono"
                        />
                      </div>
                    </div>

                    <table className="w-full text-xs font-mono">
                      <thead className="text-[10px] text-zinc-400 bg-neutral-900">
                        <tr>
                          <th className="py-1 px-2 text-left">Tempo</th>
                          <th className="py-1 px-2 text-right">Resistência Obtida (MΩ)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800">
                        <tr>
                          <td className="py-1.5 px-2 text-zinc-300">30 Seg.</td>
                          <td className="py-1.5 px-2">
                            <input
                              type="text"
                              placeholder="MΩ"
                              value={formData.isolacaoAntes.res30s}
                              onChange={(e) => handleUpdateIsolacaoAntes('res30s', e.target.value)}
                              className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-0.5 text-xs text-white text-right"
                            />
                          </td>
                        </tr>
                        <tr>
                          <td className="py-1.5 px-2 text-zinc-300">1 Min.</td>
                          <td className="py-1.5 px-2">
                            <input
                              type="text"
                              placeholder="MΩ"
                              value={formData.isolacaoAntes.res1min}
                              onChange={(e) => handleUpdateIsolacaoAntes('res1min', e.target.value)}
                              className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-0.5 text-xs text-white text-right"
                            />
                          </td>
                        </tr>
                        <tr>
                          <td className="py-1.5 px-2 text-zinc-300">10 Min.</td>
                          <td className="py-1.5 px-2">
                            <input
                              type="text"
                              placeholder="MΩ"
                              value={formData.isolacaoAntes.res10min}
                              onChange={(e) => handleUpdateIsolacaoAntes('res10min', e.target.value)}
                              className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-0.5 text-xs text-white text-right"
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-800/80">
                      <div className="bg-neutral-900 p-2 rounded">
                        <label className="block text-[10px] text-zinc-400 mb-0.5">Índice Absorção Dielétrica:</label>
                        <input
                          type="text"
                          placeholder="( 1min / 30s )"
                          value={formData.isolacaoAntes.indiceAbsorcao}
                          onChange={(e) => handleUpdateIsolacaoAntes('indiceAbsorcao', e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-700 rounded px-2 py-0.5 text-xs text-amber-300 font-mono font-bold text-center"
                        />
                      </div>
                      <div className="bg-neutral-900 p-2 rounded">
                        <label className="block text-[10px] text-zinc-400 mb-0.5">Índice de Polarização:</label>
                        <input
                          type="text"
                          placeholder="( 10min / 1min )"
                          value={formData.isolacaoAntes.indicePolarizacao}
                          onChange={(e) => handleUpdateIsolacaoAntes('indicePolarizacao', e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-700 rounded px-2 py-0.5 text-xs text-amber-300 font-mono font-bold text-center"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Isolação Depois */}
                  <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 space-y-2">
                    <div className="text-[11px] font-bold text-amber-300 uppercase border-b border-neutral-800 pb-1 flex items-center justify-between">
                      <span>RESISTÊNCIA DE ISOLAÇÃO (DEPOIS)</span>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-zinc-400">Tensão:</span>
                        <input
                          type="text"
                          placeholder="1000 Vcc"
                          value={formData.isolacaoDepois.tensaoAplicadaVcc}
                          onChange={(e) => handleUpdateIsolacaoDepois('tensaoAplicadaVcc', e.target.value)}
                          className="bg-neutral-900 border border-neutral-700 rounded px-1.5 py-0.5 text-[11px] text-white w-20 text-center font-mono"
                        />
                      </div>
                    </div>

                    <table className="w-full text-xs font-mono">
                      <thead className="text-[10px] text-zinc-400 bg-neutral-900">
                        <tr>
                          <th className="py-1 px-2 text-left">Tempo</th>
                          <th className="py-1 px-2 text-right">Resistência Obtida (MΩ)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800">
                        <tr>
                          <td className="py-1.5 px-2 text-zinc-300">30 Seg.</td>
                          <td className="py-1.5 px-2">
                            <input
                              type="text"
                              placeholder="MΩ"
                              value={formData.isolacaoDepois.res30s}
                              onChange={(e) => handleUpdateIsolacaoDepois('res30s', e.target.value)}
                              className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-0.5 text-xs text-white text-right"
                            />
                          </td>
                        </tr>
                        <tr>
                          <td className="py-1.5 px-2 text-zinc-300">1 Min.</td>
                          <td className="py-1.5 px-2">
                            <input
                              type="text"
                              placeholder="MΩ"
                              value={formData.isolacaoDepois.res1min}
                              onChange={(e) => handleUpdateIsolacaoDepois('res1min', e.target.value)}
                              className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-0.5 text-xs text-white text-right"
                            />
                          </td>
                        </tr>
                        <tr>
                          <td className="py-1.5 px-2 text-zinc-300">10 Min.</td>
                          <td className="py-1.5 px-2">
                            <input
                              type="text"
                              placeholder="MΩ"
                              value={formData.isolacaoDepois.res10min}
                              onChange={(e) => handleUpdateIsolacaoDepois('res10min', e.target.value)}
                              className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-0.5 text-xs text-white text-right"
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-800/80">
                      <div className="bg-neutral-900 p-2 rounded">
                        <label className="block text-[10px] text-zinc-400 mb-0.5">Índice Absorção Dielétrica:</label>
                        <input
                          type="text"
                          placeholder="( 1min / 30s )"
                          value={formData.isolacaoDepois.indiceAbsorcao}
                          onChange={(e) => handleUpdateIsolacaoDepois('indiceAbsorcao', e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-700 rounded px-2 py-0.5 text-xs text-amber-300 font-mono font-bold text-center"
                        />
                      </div>
                      <div className="bg-neutral-900 p-2 rounded">
                        <label className="block text-[10px] text-zinc-400 mb-0.5">Índice de Polarização:</label>
                        <input
                          type="text"
                          placeholder="( 10min / 1min )"
                          value={formData.isolacaoDepois.indicePolarizacao}
                          onChange={(e) => handleUpdateIsolacaoDepois('indicePolarizacao', e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-700 rounded px-2 py-0.5 text-xs text-amber-300 font-mono font-bold text-center"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Critérios de Referência Kinross */}
                <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-[11px]">
                  <span className="font-bold text-zinc-300 block mb-1">Critérios de Avaliação Técnica (Padrão Kinross):</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-zinc-400">
                    <div className="bg-neutral-900/80 p-2 rounded border border-neutral-800">
                      <span className="text-amber-400 font-semibold block mb-0.5">Índice de Polarização (I.P):</span>
                      <ul className="space-y-0.5 font-mono text-[10px]">
                        <li>• I.P &lt; 1,0 ➔ <span className="text-rose-400 font-bold">Ruim</span></li>
                        <li>• 2,0 &gt; I.P &gt; 1,0 ➔ <span className="text-amber-400 font-bold">Atenção</span></li>
                        <li>• 4,0 &gt; I.P &gt; 2,0 ➔ <span className="text-blue-400 font-bold">Bom</span></li>
                        <li>• I.P &gt; 4,0 ➔ <span className="text-emerald-400 font-bold">Excelente</span></li>
                      </ul>
                    </div>

                    <div className="bg-neutral-900/80 p-2 rounded border border-neutral-800">
                      <span className="text-amber-400 font-semibold block mb-0.5">Índice de Absorção Dielétrica:</span>
                      <ul className="space-y-0.5 font-mono text-[10px]">
                        <li>• I.A.D &lt; 1,1 ➔ <span className="text-rose-400 font-bold">Ruim</span></li>
                        <li>• 1,25 &gt; I.A.D &gt; 1,1 ➔ <span className="text-amber-400 font-bold">Atenção</span></li>
                        <li>• 1,60 &gt; I.A.D &gt; 1,25 ➔ <span className="text-blue-400 font-bold">Bom</span></li>
                        <li>• I.A.D &gt; 1,60 ➔ <span className="text-emerald-400 font-bold">Excelente</span></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Seção: RESISTÊNCIA DE AQUECIMENTO & BOBINA DE FREIO */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Aquecimento */}
                <div className="bg-black rounded-xl border border-neutral-800 p-3.5 space-y-2">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                    Resistência de Aquecimento (Se Aplicável)
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="block text-[10px] text-zinc-400">Individual (Ω):</label>
                      <input
                        type="text"
                        placeholder="Ω"
                        value={formData.aquecimentoIndividualOhm}
                        onChange={(e) => setFormData({ ...formData, aquecimentoIndividualOhm: e.target.value })}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-400">Isolação x Massa (MΩ):</label>
                      <input
                        type="text"
                        placeholder="MΩ"
                        value={formData.aquecimentoIsolacaoMassaMohm}
                        onChange={(e) => setFormData({ ...formData, aquecimentoIsolacaoMassaMohm: e.target.value })}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Freio */}
                <div className="bg-black rounded-xl border border-neutral-800 p-3.5 space-y-2">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                    Bobina de Freio (Se Aplicável)
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="block text-[10px] text-zinc-400">Resistência (Ω):</label>
                      <input
                        type="text"
                        placeholder="Ω"
                        value={formData.freioResistenciaOhm}
                        onChange={(e) => setFormData({ ...formData, freioResistenciaOhm: e.target.value })}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-400">Isolação x Massa (MΩ):</label>
                      <input
                        type="text"
                        placeholder="MΩ"
                        value={formData.freioIsolacaoMassaMohm}
                        onChange={(e) => setFormData({ ...formData, freioIsolacaoMassaMohm: e.target.value })}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* TAB 2: MECÂNICA & FOLGAS (PÁGINA 2 DO PDF) */
            <>
              {/* Header Pág 2 */}
              <div className="bg-black rounded-xl border border-neutral-800 p-4 space-y-3">
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5" />
                    Descrição da Atividade & Executantes
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">PDF Pág. 2</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">Executantes:</label>
                    <input
                      type="text"
                      placeholder="Nomes dos mecânicos / eletricistas"
                      value={formData.executantes}
                      onChange={(e) => setFormData({ ...formData, executantes: e.target.value })}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">TAG:</label>
                    <input
                      type="text"
                      value={formData.tag}
                      readOnly
                      className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-xs text-amber-300 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">OS:</label>
                    <input
                      type="text"
                      value={formData.os}
                      readOnly
                      className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-xs text-amber-300 font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-neutral-800">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-300 mb-0.5">
                      1º Verificação das Condições que o Equipamento Chegou na Oficina:
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Descreva o estado visual, avarias, conexões e condições gerais de chegada..."
                      value={formData.condicoesChegadaObs}
                      onChange={(e) => setFormData({ ...formData, condicoesChegadaObs: e.target.value })}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-1.5 text-xs text-white resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-300 mb-0.5">
                      2º Desmontagem de Componentes (Observações):
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Observações durante a desmontagem de tampas, defletor, ventilador, anéis, etc..."
                      value={formData.desmontagemComponentesObs}
                      onChange={(e) => setFormData({ ...formData, desmontagemComponentesObs: e.target.value })}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-1.5 text-xs text-white resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Verificação de Folga: ROLAMENTOS */}
              <div className="bg-black rounded-xl border border-neutral-800 p-4 space-y-3">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5" />
                  Verificação de Folga: Rolamentos
                </span>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-neutral-900 text-zinc-400 uppercase text-[10px]">
                      <tr>
                        <th className="py-2 px-3 text-left w-16">Posição</th>
                        <th className="py-2 px-3 text-left">Código</th>
                        <th className="py-2 px-3 text-left">Numeração</th>
                        <th className="py-2 px-3 text-left">Medida Externa</th>
                        <th className="py-2 px-3 text-left">Medida Interna</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800 font-mono">
                      <tr>
                        <td className="py-2 px-3 font-bold text-amber-400 font-sans">LA</td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            placeholder="Código"
                            value={formData.rolamentos.la.codigo}
                            onChange={(e) => setFormData({
                              ...formData,
                              rolamentos: {
                                ...formData.rolamentos,
                                la: { ...formData.rolamentos.la, codigo: e.target.value }
                              }
                            })}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            placeholder="Ex: 6319 C3"
                            value={formData.rolamentos.la.numeracao}
                            onChange={(e) => setFormData({
                              ...formData,
                              rolamentos: {
                                ...formData.rolamentos,
                                la: { ...formData.rolamentos.la, numeracao: e.target.value }
                              }
                            })}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            placeholder="Ex: 200.00 mm"
                            value={formData.rolamentos.la.medidaExterna}
                            onChange={(e) => setFormData({
                              ...formData,
                              rolamentos: {
                                ...formData.rolamentos,
                                la: { ...formData.rolamentos.la, medidaExterna: e.target.value }
                              }
                            })}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            placeholder="Ex: 95.00 mm"
                            value={formData.rolamentos.la.medidaInterna}
                            onChange={(e) => setFormData({
                              ...formData,
                              rolamentos: {
                                ...formData.rolamentos,
                                la: { ...formData.rolamentos.la, medidaInterna: e.target.value }
                              }
                            })}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-bold text-amber-400 font-sans">LOA</td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            placeholder="Código"
                            value={formData.rolamentos.loa.codigo}
                            onChange={(e) => setFormData({
                              ...formData,
                              rolamentos: {
                                ...formData.rolamentos,
                                loa: { ...formData.rolamentos.loa, codigo: e.target.value }
                              }
                            })}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            placeholder="Ex: 6316 C3"
                            value={formData.rolamentos.loa.numeracao}
                            onChange={(e) => setFormData({
                              ...formData,
                              rolamentos: {
                                ...formData.rolamentos,
                                loa: { ...formData.rolamentos.loa, numeracao: e.target.value }
                              }
                            })}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            placeholder="Ex: 170.00 mm"
                            value={formData.rolamentos.loa.medidaExterna}
                            onChange={(e) => setFormData({
                              ...formData,
                              rolamentos: {
                                ...formData.rolamentos,
                                loa: { ...formData.rolamentos.loa, medidaExterna: e.target.value }
                              }
                            })}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            placeholder="Ex: 80.00 mm"
                            value={formData.rolamentos.loa.medidaInterna}
                            onChange={(e) => setFormData({
                              ...formData,
                              rolamentos: {
                                ...formData.rolamentos,
                                loa: { ...formData.rolamentos.loa, medidaInterna: e.target.value }
                              }
                            })}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Medições: EIXO & MANCAL */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* EIXO */}
                <div className="bg-black rounded-xl border border-neutral-800 p-4 space-y-3">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                    Eixo (Medições H / V)
                  </span>

                  <table className="w-full text-xs">
                    <thead className="bg-neutral-900 text-zinc-400 uppercase text-[10px]">
                      <tr>
                        <th className="py-1.5 px-2 text-left">Ponto</th>
                        <th className="py-1.5 px-2 text-left">H (Horizontal)</th>
                        <th className="py-1.5 px-2 text-left">V (Vertical)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800 font-mono">
                      <tr>
                        <td className="py-2 px-2 font-bold text-amber-400 font-sans">LA</td>
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            placeholder="H"
                            value={formData.eixo.la.h}
                            onChange={(e) => setFormData({
                              ...formData,
                              eixo: { ...formData.eixo, la: { ...formData.eixo.la, h: e.target.value } }
                            })}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            placeholder="V"
                            value={formData.eixo.la.v}
                            onChange={(e) => setFormData({
                              ...formData,
                              eixo: { ...formData.eixo, la: { ...formData.eixo.la, v: e.target.value } }
                            })}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 px-2 font-bold text-amber-400 font-sans">LCA</td>
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            placeholder="H"
                            value={formData.eixo.lca.h}
                            onChange={(e) => setFormData({
                              ...formData,
                              eixo: { ...formData.eixo, lca: { ...formData.eixo.lca, h: e.target.value } }
                            })}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            placeholder="V"
                            value={formData.eixo.lca.v}
                            onChange={(e) => setFormData({
                              ...formData,
                              eixo: { ...formData.eixo, lca: { ...formData.eixo.lca, v: e.target.value } }
                            })}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <div>
                    <label className="block text-[10px] text-zinc-400 mb-0.5">Observações do Eixo:</label>
                    <textarea
                      rows={2}
                      placeholder="Observações sobre pistas, desgaste, rugosidade ou excentricidade..."
                      value={formData.eixo.observacoes}
                      onChange={(e) => setFormData({
                        ...formData,
                        eixo: { ...formData.eixo, observacoes: e.target.value }
                      })}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white resize-none"
                    />
                  </div>
                </div>

                {/* MANCAL */}
                <div className="bg-black rounded-xl border border-neutral-800 p-4 space-y-3">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                    Mancal (Medições H / V)
                  </span>

                  <table className="w-full text-xs">
                    <thead className="bg-neutral-900 text-zinc-400 uppercase text-[10px]">
                      <tr>
                        <th className="py-1.5 px-2 text-left">Ponto</th>
                        <th className="py-1.5 px-2 text-left">H (Horizontal)</th>
                        <th className="py-1.5 px-2 text-left">V (Vertical)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800 font-mono">
                      <tr>
                        <td className="py-2 px-2 font-bold text-amber-400 font-sans">LA</td>
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            placeholder="H"
                            value={formData.mancal.la.h}
                            onChange={(e) => setFormData({
                              ...formData,
                              mancal: { ...formData.mancal, la: { ...formData.mancal.la, h: e.target.value } }
                            })}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            placeholder="V"
                            value={formData.mancal.la.v}
                            onChange={(e) => setFormData({
                              ...formData,
                              mancal: { ...formData.mancal, la: { ...formData.mancal.la, v: e.target.value } }
                            })}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 px-2 font-bold text-amber-400 font-sans">LAO</td>
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            placeholder="H"
                            value={formData.mancal.lao.h}
                            onChange={(e) => setFormData({
                              ...formData,
                              mancal: { ...formData.mancal, lao: { ...formData.mancal.lao, h: e.target.value } }
                            })}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            placeholder="V"
                            value={formData.mancal.lao.v}
                            onChange={(e) => setFormData({
                              ...formData,
                              mancal: { ...formData.mancal, lao: { ...formData.mancal.lao, v: e.target.value } }
                            })}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <div>
                    <label className="block text-[10px] text-zinc-400 mb-0.5">Observações do Mancal:</label>
                    <textarea
                      rows={2}
                      placeholder="Observações sobre alojamento, ovalização, desgaste ou buchas..."
                      value={formData.mancal.observacoes}
                      onChange={(e) => setFormData({
                        ...formData,
                        mancal: { ...formData.mancal, observacoes: e.target.value }
                      })}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Modificações / Ajustes Realizados */}
              <div className="bg-black rounded-xl border border-neutral-800 p-4 space-y-2">
                <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Modificações / Ajustes Realizados:
                </label>
                <textarea
                  rows={3}
                  placeholder="Relate usinagens, metalizações, substituições de peças, embuchamentos ou balanceamento realizados..."
                  value={formData.modificacoesAjustesObs}
                  onChange={(e) => setFormData({ ...formData, modificacoesAjustesObs: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-xs text-white resize-none"
                />
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-black px-4 sm:px-6 py-3 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="chk-enable-motor-pdf"
              checked={formData.enabled}
              onChange={(e) => setFormData((prev) => ({ ...prev, enabled: e.target.checked }))}
              className="rounded text-amber-500 focus:ring-amber-500 bg-neutral-900 border-neutral-700"
            />
            <label htmlFor="chk-enable-motor-pdf" className="text-xs text-zinc-300 cursor-pointer font-medium">
              Ativar e incluir folha de Motores Elétricos no laudo PDF final
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
              <span>Salvar Medições do Motor</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
