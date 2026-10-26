import React, { useState } from 'react';
import { 
  Tag, 
  Wrench, 
  Calendar, 
  FileText, 
  User, 
  AlertTriangle, 
  FileSpreadsheet, 
  Ruler, 
  Cog, 
  Waves, 
  Disc, 
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Zap
} from 'lucide-react';
import { MaintenanceReport, AppSettings } from '../types';
import { ExcelAdjustmentModal } from './ExcelAdjustmentModal';
import { ExcelProcedureModal } from './ExcelProcedureModal';
import { PartsOrderModal } from './PartsOrderModal';
import { ElectricMotorModal } from './ElectricMotorModal';
import { 
  createDefaultAdjustmentSheet, 
  createDefaultProcedureRedutores, 
  createDefaultProcedureBombas, 
  createDefaultProcedureMancais,
  createDefaultPartsOrderSheet,
  createDefaultMotorSheet,
  hasAdjustmentSheetData,
  hasProcedureSheetData,
  hasPartsOrderSheetData,
  hasMotorSheetData
} from '../data/sheetsData';

interface ReportHeaderFormProps {
  report: MaintenanceReport;
  onChange: (updated: Partial<MaintenanceReport>) => void;
  showValidationErrors?: boolean;
  preconfiguredEmail?: string;
  settings?: AppSettings;
  onUpdateAppSettings?: (settings: AppSettings) => void;
}

export const ReportHeaderForm: React.FC<ReportHeaderFormProps> = ({
  report,
  onChange,
  showValidationErrors = false,
  preconfiguredEmail,
  settings,
  onUpdateAppSettings,
}) => {
  const [activeSheetModal, setActiveSheetModal] = useState<
    'ADJUSTMENT' | 'REDUTORES' | 'BOMBAS' | 'MANCAIS' | 'PARTS' | 'MOTOR' | null
  >(null);

  const isTagMissing = !report.tag || report.tag.trim() === '';
  const isOsMissing = !report.os || report.os.trim() === '';
  const isDateMissing = !report.startDate || report.startDate.trim() === '';
  const isGeneralCommentMissing = !report.generalComment || report.generalComment.trim() === '';

  const hasAnyMandatoryMissing = isTagMissing || isOsMissing || isDateMissing || isGeneralCommentMissing;

  // Safe access to sheet objects
  const adjSheet = report.adjustmentSheet || createDefaultAdjustmentSheet();
  const procRedutores = report.procedureRedutores || createDefaultProcedureRedutores();
  const procBombas = report.procedureBombas || createDefaultProcedureBombas();
  const procMancais = report.procedureMancais || createDefaultProcedureMancais();
  const partsSheet = report.partsOrderSheet || createDefaultPartsOrderSheet(report.tag, report.os, report.title);
  const motorSheet = report.motorSheet || createDefaultMotorSheet(report.tag, report.os, report.title);

  const isAdjActive = !!report.adjustmentSheet?.enabled || hasAdjustmentSheetData(report.adjustmentSheet);
  const isProcRedutoresActive = !!report.procedureRedutores?.enabled || hasProcedureSheetData(report.procedureRedutores);
  const isProcBombasActive = !!report.procedureBombas?.enabled || hasProcedureSheetData(report.procedureBombas);
  const isProcMancaisActive = !!report.procedureMancais?.enabled || hasProcedureSheetData(report.procedureMancais);
  const isPartsActive = !!report.partsOrderSheet?.enabled || hasPartsOrderSheetData(report.partsOrderSheet);
  const isMotorActive = !!report.motorSheet?.enabled || hasMotorSheetData(report.motorSheet);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs relative overflow-hidden">
      {/* Decorative top indicator */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700" />

      {/* Header title & status badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Wrench className="w-5 h-5 text-amber-600" />
              Cabeçalho Técnico do Relatório
            </h2>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
              Campos com <span className="text-rose-600 font-bold">*</span> são obrigatórios
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-0.5 font-medium">
            Identifique o equipamento, a ordem de serviço e as medições técnicas antes da inclusão fotográfica.
          </p>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-700">Status:</label>
          <select
            id="select-status"
            value={report.status}
            onChange={(e) => onChange({ status: e.target.value as any })}
            className="bg-white border border-slate-300 text-slate-900 rounded-lg text-xs px-3 py-1.5 font-semibold focus:outline-none focus:border-amber-600"
          >
            <option value="EM_ANDAMENTO">Em Andamento</option>
            <option value="CONCLUIDO">Concluído</option>
            <option value="AGUARDANDO_PECAS">Aguardando Peças</option>
            <option value="INSPECAO">Em Inspeção</option>
          </select>
        </div>
      </div>

      {/* TABELAS EXCEL & MEDIÇÕES (ABAIXO DOS STATUS) */}
      <div className="mb-5 p-3.5 rounded-xl bg-slate-50 border border-amber-300/80 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
              <FileSpreadsheet className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 tracking-wide">
                  Tabelas Técnicas & Medições (Formato Excel)
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold">
                  Oficina Central
                </span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium">
                Selecione as planilhas para preencher medidas e checklists de reforma. Serão anexadas ao final do PDF.
              </p>
            </div>
          </div>
        </div>

        {/* 6 Interactive Table Buttons with Specific Icons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {/* Card 1: Folha de Ajustes - Redutores */}
          <button
            type="button"
            onClick={() => setActiveSheetModal('ADJUSTMENT')}
            className={`text-left p-3 rounded-xl border transition group relative overflow-hidden flex flex-col justify-between ${
              isAdjActive
                ? 'bg-amber-50/80 border-amber-400 shadow-xs'
                : 'bg-white hover:bg-slate-50/80 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-lg bg-slate-100 text-amber-700 group-hover:bg-amber-100 group-hover:text-amber-800 transition flex items-center justify-center">
                <Ruler className="w-3.5 h-3.5" />
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                isAdjActive
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {isAdjActive ? <CheckCircle2 className="w-3 h-3 text-amber-700" /> : null}
                {isAdjActive ? 'Ativa no PDF' : 'Preencher'}
              </span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-800 transition">
                Folha de Ajustes
              </h4>
              <p className="text-[11px] text-slate-600">
                Eixos, Mancais & Rolamentos
              </p>
            </div>
            <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-between border-t border-slate-200 pt-1.5">
              <span className="font-mono font-medium">Redutores</span>
              <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition" />
            </div>
          </button>

          {/* Card 2: Procedimento - Redutores */}
          <button
            type="button"
            onClick={() => setActiveSheetModal('REDUTORES')}
            className={`text-left p-3 rounded-xl border transition group relative overflow-hidden flex flex-col justify-between ${
              isProcRedutoresActive
                ? 'bg-amber-50/80 border-amber-400 shadow-xs'
                : 'bg-white hover:bg-slate-50/80 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-lg bg-slate-100 text-amber-700 group-hover:bg-amber-100 group-hover:text-amber-800 transition flex items-center justify-center">
                <Cog className="w-3.5 h-3.5" />
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                isProcRedutoresActive
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {isProcRedutoresActive ? <CheckCircle2 className="w-3 h-3 text-amber-700" /> : null}
                {isProcRedutoresActive ? 'Ativo no PDF' : 'Checklist'}
              </span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-800 transition">
                Proc. Redutores
              </h4>
              <p className="text-[11px] text-slate-600">
                Checklist reforma (7 etapas)
              </p>
            </div>
            <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-between border-t border-slate-200 pt-1.5">
              <span className="font-mono font-medium">S / N / NA</span>
              <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition" />
            </div>
          </button>

          {/* Card 3: Procedimento - Bombas */}
          <button
            type="button"
            onClick={() => setActiveSheetModal('BOMBAS')}
            className={`text-left p-3 rounded-xl border transition group relative overflow-hidden flex flex-col justify-between ${
              isProcBombasActive
                ? 'bg-amber-50/80 border-amber-400 shadow-xs'
                : 'bg-white hover:bg-slate-50/80 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-lg bg-slate-100 text-amber-700 group-hover:bg-amber-100 group-hover:text-amber-800 transition flex items-center justify-center">
                <Waves className="w-3.5 h-3.5" />
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                isProcBombasActive
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {isProcBombasActive ? <CheckCircle2 className="w-3 h-3 text-amber-700" /> : null}
                {isProcBombasActive ? 'Ativo no PDF' : 'Checklist'}
              </span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-800 transition">
                Proc. Bombas
              </h4>
              <p className="text-[11px] text-slate-600">
                Checklist reforma de bombas
              </p>
            </div>
            <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-between border-t border-slate-200 pt-1.5">
              <span className="font-mono font-medium">S / N / NA</span>
              <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition" />
            </div>
          </button>

          {/* Card 4: Procedimento - Mancais */}
          <button
            type="button"
            onClick={() => setActiveSheetModal('MANCAIS')}
            className={`text-left p-3 rounded-xl border transition group relative overflow-hidden flex flex-col justify-between ${
              isProcMancaisActive
                ? 'bg-amber-50/80 border-amber-400 shadow-xs'
                : 'bg-white hover:bg-slate-50/80 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-lg bg-slate-100 text-amber-700 group-hover:bg-amber-100 group-hover:text-amber-800 transition flex items-center justify-center">
                <Disc className="w-3.5 h-3.5" />
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                isProcMancaisActive
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {isProcMancaisActive ? <CheckCircle2 className="w-3 h-3 text-amber-700" /> : null}
                {isProcMancaisActive ? 'Ativo no PDF' : 'Checklist'}
              </span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-800 transition">
                Proc. Mancais
              </h4>
              <p className="text-[11px] text-slate-600">
                Checklist reforma de mancais
              </p>
            </div>
            <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-between border-t border-slate-200 pt-1.5">
              <span className="font-mono font-medium">S / N / NA</span>
              <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition" />
            </div>
          </button>

          {/* Card 5: Lista de Peças */}
          <button
            type="button"
            onClick={() => setActiveSheetModal('PARTS')}
            className={`text-left p-3 rounded-xl border transition group relative overflow-hidden flex flex-col justify-between ${
              isPartsActive
                ? 'bg-amber-50/80 border-amber-400 shadow-xs'
                : 'bg-white hover:bg-slate-50/80 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-lg bg-slate-100 text-amber-700 group-hover:bg-amber-100 group-hover:text-amber-800 transition flex items-center justify-center">
                <ClipboardList className="w-3.5 h-3.5" />
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                isPartsActive
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {isPartsActive ? <CheckCircle2 className="w-3 h-3 text-amber-700" /> : null}
                {isPartsActive ? 'Ativo no PDF' : 'Preencher'}
              </span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-800 transition">
                Pedido de Peças
              </h4>
              <p className="text-[11px] text-slate-600">
                Lista de requisição & Part Number
              </p>
            </div>
            <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-between border-t border-slate-200 pt-1.5">
              <span className="font-mono font-medium">
                {partsSheet.items.filter(i => i.codigo || i.descricaoPartNumber).length} itens
              </span>
              <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition" />
            </div>
          </button>

          {/* Card 6: Motores Elétricos */}
          <button
            type="button"
            onClick={() => setActiveSheetModal('MOTOR')}
            className={`text-left p-3 rounded-xl border transition group relative overflow-hidden flex flex-col justify-between ${
              isMotorActive
                ? 'bg-amber-50/80 border-amber-400 shadow-xs'
                : 'bg-white hover:bg-slate-50/80 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-lg bg-slate-100 text-amber-700 group-hover:bg-amber-100 group-hover:text-amber-800 transition flex items-center justify-center">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                isMotorActive
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {isMotorActive ? <CheckCircle2 className="w-3 h-3 text-amber-700" /> : null}
                {isMotorActive ? 'Ativo no PDF' : 'Preencher'}
              </span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-800 transition">
                Motores Elétricos
              </h4>
              <p className="text-[11px] text-slate-600">
                Ensaios elétricos, DR & Folgas
              </p>
            </div>
            <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-between border-t border-slate-200 pt-1.5">
              <span className="font-mono font-medium">
                {motorSheet.potenciaCv ? `${motorSheet.potenciaCv} CV` : '2 Páginas'}
              </span>
              <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition" />
            </div>
          </button>
        </div>
      </div>

      {/* Validation warning banner if any required is missing and checked */}
      {showValidationErrors && hasAnyMandatoryMissing && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>
            <strong>Atenção:</strong> Por exigência técnica, os campos <strong>TAG</strong>, <strong>OS</strong>, <strong>Data de Início</strong> e <strong>Comentário Geral</strong> são obrigatórios para a emissão do PDF.
          </span>
        </div>
      )}

      {/* Grid for Mandatory & Basic Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* TAG Field (MANDATORY) */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-amber-600" />
              TAG do Equipamento <span className="text-rose-600 font-bold">*</span>
            </span>
            {showValidationErrors && isTagMissing && (
              <span className="text-[10px] text-rose-600 font-bold">Obrigatório</span>
            )}
          </label>
          <input
            id="input-header-tag"
            type="text"
            required
            placeholder="Ex: 31BO501DM1"
            value={report.tag}
            onChange={(e) => onChange({ tag: e.target.value.toUpperCase() })}
            className={`w-full bg-white px-3.5 py-2.5 rounded-xl text-sm text-slate-900 font-mono placeholder:text-slate-400 focus:outline-none transition ${
              showValidationErrors && isTagMissing
                ? 'border-2 border-rose-500 ring-2 ring-rose-500/20'
                : 'border border-slate-300 focus:border-amber-600 focus:ring-1 focus:ring-amber-600'
            }`}
          />
        </div>

        {/* OS Field (MANDATORY) */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-600" />
              Ordem de Serviço (OS) <span className="text-rose-600 font-bold">*</span>
            </span>
            {showValidationErrors && isOsMissing && (
              <span className="text-[10px] text-rose-600 font-bold">Obrigatório</span>
            )}
          </label>
          <input
            id="input-header-os"
            type="text"
            required
            placeholder="Ex: 5956161"
            value={report.os}
            onChange={(e) => onChange({ os: e.target.value })}
            className={`w-full bg-white px-3.5 py-2.5 rounded-xl text-sm text-slate-900 font-mono placeholder:text-slate-400 focus:outline-none transition ${
              showValidationErrors && isOsMissing
                ? 'border-2 border-rose-500 ring-2 ring-rose-500/20'
                : 'border border-slate-300 focus:border-amber-600 focus:ring-1 focus:ring-amber-600'
            }`}
          />
        </div>

        {/* Start Date Field (MANDATORY) */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              Data de Início <span className="text-rose-600 font-bold">*</span>
            </span>
            {showValidationErrors && isDateMissing && (
              <span className="text-[10px] text-rose-600 font-bold">Obrigatório</span>
            )}
          </label>
          <input
            id="input-header-startdate"
            type="date"
            required
            value={report.startDate}
            onChange={(e) => onChange({ startDate: e.target.value })}
            className={`w-full bg-white px-3.5 py-2.5 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition ${
              showValidationErrors && isDateMissing
                ? 'border-2 border-rose-500 ring-2 ring-rose-500/20'
                : 'border border-slate-300 focus:border-amber-600 focus:ring-1 focus:ring-amber-600'
            }`}
          />
        </div>

        {/* Technician Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-amber-600" />
            Técnico Responsável
          </label>
          <input
            id="input-header-technician"
            type="text"
            placeholder="Nome do técnico"
            value={report.technician}
            onChange={(e) => onChange({ technician: e.target.value })}
            className="w-full bg-white px-3.5 py-2.5 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 border border-slate-300 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 transition"
          />
        </div>
      </div>

      {/* General Comment / Scope (MANDATORY) with automatic word break */}
      <div className="mt-4">
        <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-amber-600" />
            Comentário Geral / Escopo do Trabalho <span className="text-rose-600 font-bold">*</span>
          </span>
          {showValidationErrors && isGeneralCommentMissing && (
            <span className="text-[10px] text-rose-600 font-bold">Obrigatório</span>
          )}
        </label>
        <textarea
          id="input-header-general-comment"
          required
          rows={3}
          placeholder="Ex: Processo de desmontagem e análise do motor..."
          value={report.generalComment}
          onChange={(e) => onChange({ generalComment: e.target.value })}
          className={`w-full bg-white px-3.5 py-2.5 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition leading-relaxed break-words whitespace-pre-wrap ${
            showValidationErrors && isGeneralCommentMissing
              ? 'border-2 border-rose-500 ring-2 ring-rose-500/20'
              : 'border border-slate-300 focus:border-amber-600 focus:ring-1 focus:ring-amber-600'
          }`}
        />
        <p className="text-[11px] text-slate-600 mt-1 font-medium">
          Este comentário geral será exibido com destaque na primeira página do relatório em PDF.
        </p>
      </div>

      {/* Excel Modals */}
      {activeSheetModal === 'ADJUSTMENT' && (
        <ExcelAdjustmentModal
          isOpen={true}
          onClose={() => setActiveSheetModal(null)}
          data={adjSheet}
          reportTag={report.tag || 'N/A'}
          reportOs={report.os || 'N/A'}
          onSave={(updated) => onChange({ adjustmentSheet: updated })}
        />
      )}

      {activeSheetModal === 'REDUTORES' && (
        <ExcelProcedureModal
          isOpen={true}
          onClose={() => setActiveSheetModal(null)}
          sheet={procRedutores}
          reportTag={report.tag || 'N/A'}
          reportOs={report.os || 'N/A'}
          onSave={(updated) => onChange({ procedureRedutores: updated })}
        />
      )}

      {activeSheetModal === 'BOMBAS' && (
        <ExcelProcedureModal
          isOpen={true}
          onClose={() => setActiveSheetModal(null)}
          sheet={procBombas}
          reportTag={report.tag || 'N/A'}
          reportOs={report.os || 'N/A'}
          onSave={(updated) => onChange({ procedureBombas: updated })}
        />
      )}

      {activeSheetModal === 'MANCAIS' && (
        <ExcelProcedureModal
          isOpen={true}
          onClose={() => setActiveSheetModal(null)}
          sheet={procMancais}
          reportTag={report.tag || 'N/A'}
          reportOs={report.os || 'N/A'}
          onSave={(updated) => onChange({ procedureMancais: updated })}
        />
      )}

      {activeSheetModal === 'PARTS' && (
        <PartsOrderModal
          isOpen={true}
          onClose={() => setActiveSheetModal(null)}
          sheet={partsSheet}
          reportTag={report.tag || 'N/A'}
          reportOs={report.os || 'N/A'}
          reportEquipment={report.title || 'N/A'}
          reportTechnician={report.technician || 'N/A'}
          fixedEmail="paulo.sousa@kinross.com"
          appSettings={settings}
          onUpdateAppSettings={onUpdateAppSettings}
          onSave={(updated) => onChange({ partsOrderSheet: updated })}
        />
      )}

      {activeSheetModal === 'MOTOR' && (
        <ElectricMotorModal
          isOpen={true}
          onClose={() => setActiveSheetModal(null)}
          sheet={motorSheet}
          reportTag={report.tag || 'N/A'}
          reportOs={report.os || 'N/A'}
          reportEquipment={report.title || 'N/A'}
          reportTechnician={report.technician || 'N/A'}
          onSave={(updated) => onChange({ motorSheet: updated })}
        />
      )}
    </div>
  );
};

