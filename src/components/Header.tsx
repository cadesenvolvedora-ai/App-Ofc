import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  X, 
  Settings as SettingsIcon, 
  Mail, 
  Smartphone
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
    <header className="bg-black border-b border-neutral-800 sticky top-0 z-40 shadow-lg">
      {/* Top Brand Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Logo & Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-600 to-yellow-600 flex items-center justify-center text-white shadow-md shadow-amber-600/20 flex-shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                Relatório Técnico
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                Manutenção Industrial
              </span>
            </div>
            <p className="text-xs text-zinc-400 hidden sm:block truncate">
              Destinatário Gmail:{' '}
              <span className="text-amber-300 font-medium">
                {preconfiguredEmail || 'Não configurado'}
              </span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Settings Button */}
          <button
            id="btn-open-settings"
            onClick={onOpenSettings}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-neutral-900 border border-neutral-800 transition active:scale-95"
            title="Configurações (E-mails destinatários, Técnico, Empresa)"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>

          {/* Generate PDF & Send via Gmail CTA */}
          <button
            id="btn-generate-pdf-main"
            onClick={onOpenExportModal}
            className={`inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md transition active:scale-95 ${
              hasValidationErrors
                ? 'bg-amber-600/90 hover:bg-amber-600 text-white animate-pulse'
                : 'bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white shadow-amber-600/25'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Gerar PDF & Gmail</span>
          </button>
        </div>
      </div>

      {/* Multi-Tab Navigation Bar ("opção como uma nova aba de relatório sem que ele perca o relatório anterior") */}
      <div className="border-t border-neutral-800 bg-black/90 px-3 sm:px-6 py-1.5 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider hidden sm:inline-block flex-shrink-0 mr-1">
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
                className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition select-none flex-shrink-0 border ${
                  isActive
                    ? 'bg-amber-950/70 border-amber-500/50 text-amber-200 shadow-sm'
                    : 'bg-neutral-900/60 border-neutral-800 text-zinc-400 hover:text-zinc-200 hover:bg-neutral-800/60'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-amber-400' : 'bg-zinc-600'}`} />
                <span className="max-w-[140px] sm:max-w-[180px] truncate">
                  {tabLabel}
                </span>

                {/* Photo Count badge */}
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  isActive ? 'bg-amber-500/20 text-amber-300' : 'bg-neutral-800 text-zinc-500'
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
                    className="p-0.5 rounded text-zinc-500 hover:text-rose-400 hover:bg-neutral-800 transition ml-0.5"
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
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-amber-400 hover:text-amber-300 text-xs font-semibold border border-neutral-800 transition active:scale-95 flex-shrink-0"
          title="Abrir uma nova aba de relatório em branco sem perder os anteriores"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Nova Aba</span>
        </button>
      </div>

      {/* iOS Safari Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-200">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-sky-400" />
              Instalar aplicativo no iOS
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              1. Toque no botão de <strong>Compartilhar</strong> (ícone do quadrado com seta para cima) na barra inferior do Safari.<br />
              2. Role a lista para baixo e selecione <strong>Adicionar à Tela de Início</strong>.<br />
              3. O aplicativo abrirá em tela cheia com alta velocidade e suporte offline.
            </p>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold transition"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
