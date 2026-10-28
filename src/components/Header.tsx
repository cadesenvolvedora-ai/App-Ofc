import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  X, 
  Settings as SettingsIcon, 
  Mail, 
  Smartphone,
  ShieldCheck
} from 'lucide-react';
import { MaintenanceReport } from '../types';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface HeaderProps {
  reports: MaintenanceReport[];
  activeReportId: string;
  onSelectReport: (id: string) => void;
  onCreateNewReport: () => void;
  onCloseReport: (id: string) => void;
  onOpenSettings: () => void;
  onOpenExportModal: () => void;
  preconfiguredEmail: string;
  hasValidationErrors?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  reports,
  activeReportId,
  onSelectReport,
  onCreateNewReport,
  onCloseReport,
  onOpenSettings,
  onOpenExportModal,
  preconfiguredEmail,
  hasValidationErrors,
}) => {
  const { isInstallable, isInstalled, install, isIOS } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Top Brand Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Logo & Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-600 to-yellow-600 flex items-center justify-center text-white shadow-md shadow-amber-600/20 flex-shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate">
                Relatório Técnico
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-900 border border-amber-300">
                Manutenção Industrial
              </span>
            </div>
            <p className="text-xs text-slate-600 hidden sm:block truncate font-medium">
              Destinatário Gmail:{' '}
              <span className="text-amber-800 font-bold">
                {preconfiguredEmail || 'Não configurado'}
              </span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Permanent memory protection badge */}
          <div 
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold"
            title="Armazenamento permanente ativo no tablet: dados e fotos não se perdem ao conectar no carregador ou fechar o app"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Memória Protegida</span>
          </div>

          {/* Settings Button */}
          <button
            id="btn-open-settings"
            onClick={onOpenSettings}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition active:scale-95"
            title="Configurações (E-mails destinatários, Técnico, Empresa)"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>

          {/* Generate PDF & Send via Gmail CTA */}
          <button
            id="btn-generate-pdf-main"
            onClick={onOpenExportModal}
            className={`inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition active:scale-95 ${
              hasValidationErrors
                ? 'bg-amber-600 hover:bg-amber-700 text-white animate-pulse'
                : 'bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white shadow-amber-600/20'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Gerar PDF & Gmail</span>
          </button>
        </div>
      </div>

      {/* Multi-Tab Navigation Bar ("opção como uma nova aba de relatório sem que ele perca o relatório anterior") */}
      <div className="border-t border-slate-200 bg-slate-50/90 px-3 sm:px-6 py-1.5 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden sm:inline-block flex-shrink-0 mr-1">
          Abas:
        </span>

        {/* List of tabs */}
        <div className="flex items-center gap-1.5 min-w-0">
          {reports.map((report, idx) => {
            const isActive = report.id === activeReportId;
            const tabLabel = report.tag 
              ? `${report.tag}${report.os ? ` (OS: ${report.os})` : ''}` 
              : report.title || `Relatório #${idx + 1}`;

            return (
              <div
                key={report.id}
                id={`tab-report-${report.id}`}
                onClick={() => onSelectReport(report.id)}
                className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition select-none flex-shrink-0 border ${
                  isActive
                    ? 'bg-white border-amber-500 text-slate-900 shadow-xs ring-1 ring-amber-500/20'
                    : 'bg-slate-200/70 border-slate-300/80 text-slate-700 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-amber-600' : 'bg-slate-400'}`} />
                <span className="max-w-[140px] sm:max-w-[180px] truncate">
                  {tabLabel}
                </span>

                {/* Photo Count badge */}
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                  isActive ? 'bg-amber-100 text-amber-900' : 'bg-white/80 text-slate-600'
                }`}>
                  {report.photos.length} fotos
                </span>

                {/* Close Tab button (only if more than 1 report exists) */}
                {reports.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseReport(report.id);
                    }}
                    className="p-0.5 rounded text-slate-500 hover:text-rose-600 hover:bg-slate-200 transition ml-0.5"
                    title="Fechar esta aba de relatório"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* New Report Tab Button */}
        <button
          id="btn-new-report-tab"
          onClick={onCreateNewReport}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-amber-800 hover:text-amber-900 text-xs font-bold border border-slate-300 shadow-xs transition active:scale-95 flex-shrink-0 cursor-pointer"
          title="Abrir uma nova aba de relatório em branco sem perder os anteriores"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nova Aba</span>
        </button>
      </div>

      {/* iOS Safari Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl text-slate-800">
            <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-sky-600" />
              Instalar aplicativo no iOS
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              1. Toque no botão de <strong>Compartilhar</strong> (ícone do quadrado com seta para cima) na barra inferior do Safari.<br />
              2. Role a lista para baixo e selecione <strong>Adicionar à Tela de Início</strong>.<br />
              3. O aplicativo abrirá em tela cheia com alta velocidade e suporte offline.
            </p>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold transition"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
