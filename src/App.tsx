import React, { useState, useEffect, useRef } from 'react';
import { MaintenanceReport, PhotoRecord, AppSettings } from './types';
import { createEmptyReport } from './data/sampleReport';
import { Header } from './components/Header';
import { ReportHeaderForm } from './components/ReportHeaderForm';
import { PhotoList } from './components/PhotoList';
import { LiveCameraModal } from './components/LiveCameraModal';
import { ExportModal } from './components/ExportModal';
import { SettingsModal } from './components/SettingsModal';
import { 
  Camera, 
  Image as ImageIcon, 
  Mail, 
  CheckCircle2, 
  AlertTriangle, 
  Smartphone, 
  FileCheck,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';

const STORAGE_KEY_REPORTS = 'ais_maintenance_reports_v3';
const STORAGE_KEY_SETTINGS = 'ais_maintenance_settings_v2';

export default function App() {
  // Load initial settings
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading settings from localStorage', e);
    }
    return {
      preconfiguredEmail: 'paulo.sousa@kinross.com',
      recipientEmails: ['paulo.sousa@kinross.com'],
      technicianDefaultName: 'Carlos A. Castro',
      companyName: 'Engenharia de Manutenção Industrial',
      photosPerPage: 1,
    };
  });

  // Load reports list (multi-tabs) - Starts with a clean blank report
  const [reports, setReports] = useState<MaintenanceReport[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REPORTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Filter out any leftover sample reports
          const nonSample = parsed.filter((r: any) => r.id !== 'rep_sample_01');
          if (nonSample.length > 0) {
            return nonSample;
          }
        }
      }
    } catch (e) {
      console.error('Error loading reports from localStorage', e);
    }
    // Clean initial blank report
    return [createEmptyReport(1)];
  });

  const [activeReportId, setActiveReportId] = useState<string>(() => {
    return reports[0]?.id || '';
  });

  // UI Modals
  const [isLiveCameraOpen, setIsLiveCameraOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Online status for Android PWA offline field support
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Persist reports to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(reports));
    } catch (e) {
      console.error('Failed to save reports to localStorage', e);
    }
  }, [reports]);

  // Persist settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings to localStorage', e);
    }
  }, [settings]);

  // Find currently active report
  const activeReport = reports.find((r) => r.id === activeReportId) || reports[0];

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3800);
  };

  // Validation function: Check mandatory header fields
  const validateReportHeader = (report: MaintenanceReport) => {
    const missing: string[] = [];
    if (!report.tag || report.tag.trim() === '') missing.push('TAG do Equipamento');
    if (!report.os || report.os.trim() === '') missing.push('Ordem de Serviço (OS)');
    if (!report.startDate || report.startDate.trim() === '') missing.push('Data de Início');
    if (!report.generalComment || report.generalComment.trim() === '') missing.push('Comentário Geral');
    return {
      isValid: missing.length === 0,
      missing,
    };
  };

  // Update active report fields
  const handleUpdateActiveReport = (updatedFields: Partial<MaintenanceReport>) => {
    setReports((prev) =>
      prev.map((r) => {
        if (r.id === activeReport.id) {
          return {
            ...r,
            ...updatedFields,
            updatedAt: Date.now(),
          };
        }
        return r;
      })
    );
  };

  // Multi-Tab: Create New Report Tab ("sem que ele perca o relatório anterior")
  const handleCreateNewReport = () => {
    const newReport = createEmptyReport(reports.length + 1);
    if (settings.technicianDefaultName) {
      newReport.technician = settings.technicianDefaultName;
    }
    setReports((prev) => [...prev, newReport]);
    setActiveReportId(newReport.id);
    setShowValidationErrors(false);
    showToast(`Nova aba criada: ${newReport.title}. Relatório anterior preservado!`, 'success');
  };

  // Multi-Tab: Close Report Tab
  const handleCloseReport = (idToClose: string) => {
    if (reports.length <= 1) {
      showToast('O aplicativo deve ter ao menos uma aba de relatório aberta.', 'info');
      return;
    }

    const reportTarget = reports.find((r) => r.id === idToClose);
    if (reportTarget && reportTarget.photos.length > 0) {
      const confirmClose = window.confirm(
        `Fechar a aba "${reportTarget.tag || reportTarget.title}"? O relatório possui ${reportTarget.photos.length} fotos.`
      );
      if (!confirmClose) return;
    }

    const nextReports = reports.filter((r) => r.id !== idToClose);
    setReports(nextReports);
    if (activeReportId === idToClose) {
      setActiveReportId(nextReports[0].id);
    }
    showToast('Aba de relatório fechada.', 'info');
  };

  // Photo handlers
  const handleAddPhoto = (newPhoto: PhotoRecord) => {
    setReports((prev) =>
      prev.map((r) => {
        if (r.id === activeReportId) {
          return {
            ...r,
            photos: [...r.photos, newPhoto],
            updatedAt: Date.now(),
          };
        }
        return r;
      })
    );
    showToast('Foto adicionada com sucesso ao relatório!', 'success');
  };

  const handleAddMultiplePhotos = (newPhotos: PhotoRecord[]) => {
    setReports((prev) =>
      prev.map((r) => {
        if (r.id === activeReportId) {
          return {
            ...r,
            photos: [...r.photos, ...newPhotos],
            updatedAt: Date.now(),
          };
        }
        return r;
      })
    );
    showToast(`${newPhotos.length} fotos adicionadas com sucesso!`, 'success');
  };

  const handleUpdatePhoto = (photoId: string, updatedFields: Partial<PhotoRecord>) => {
    setReports((prev) =>
      prev.map((r) => {
        if (r.id === activeReportId) {
          const updatedPhotos = r.photos.map((p) => {
            if (p.id === photoId) {
              return { ...p, ...updatedFields };
            }
            return p;
          });
          return {
            ...r,
            photos: updatedPhotos,
            updatedAt: Date.now(),
          };
        }
        return r;
      })
    );
  };

  const handleDeletePhoto = (photoId: string) => {
    setReports((prev) =>
      prev.map((r) => {
        if (r.id === activeReportId) {
          return {
            ...r,
            photos: r.photos.filter((p) => p.id !== photoId),
            updatedAt: Date.now(),
          };
        }
        return r;
      })
    );
    showToast('Foto removida do relatório.', 'info');
  };

  const handleReorderPhotos = (startIndex: number, endIndex: number) => {
    setReports((prev) =>
      prev.map((r) => {
        if (r.id === activeReportId) {
          if (startIndex < 0 || endIndex < 0 || startIndex >= r.photos.length || endIndex >= r.photos.length) {
            return r;
          }
          const result: PhotoRecord[] = [...r.photos];
          const [removed] = result.splice(startIndex, 1);
          result.splice(endIndex, 0, removed);
          return {
            ...r,
            photos: result,
            updatedAt: Date.now(),
          };
        }
        return r;
      })
    );
  };

  // Attempt to open Export Modal with Validation Check
  const handleOpenExport = () => {
    const validation = validateReportHeader(activeReport);
    if (!validation.isValid) {
      setShowValidationErrors(true);
      showToast(
        `Preencha os campos obrigatórios do cabeçalho: ${validation.missing.join(', ')}.`,
        'error'
      );
      // Scroll smoothly to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setShowValidationErrors(false);
    setIsExportModalOpen(true);
  };

  const headerValidation = validateReportHeader(activeReport);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans pb-24 sm:pb-12">
      {/* Top Application Bar & Multi-Tab Switcher */}
      <Header
        reports={reports}
        activeReportId={activeReport.id}
        onSelectReport={(id) => {
          setActiveReportId(id);
          setShowValidationErrors(false);
        }}
        onCreateNewReport={handleCreateNewReport}
        onCloseReport={handleCloseReport}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenExportModal={handleOpenExport}
        preconfiguredEmail={settings.preconfiguredEmail}
        hasValidationErrors={showValidationErrors && !headerValidation.isValid}
      />

      {/* Offline Toast if field connection drops */}
      {!isOnline && (
        <div className="bg-amber-600 text-white text-xs font-semibold px-4 py-1.5 text-center flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          <span>Modo Offline: Suas fotos e relatórios continuam sendo salvos localmente no dispositivo.</span>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-16 right-4 z-50 max-w-sm p-4 rounded-2xl shadow-2xl border backdrop-blur-md flex items-center gap-3 transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
            toastMessage.type === 'error'
              ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
              : toastMessage.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
              : 'bg-neutral-900/95 border-amber-500/50 text-amber-200'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          )}
          <span className="text-xs font-medium leading-snug">{toastMessage.text}</span>
        </div>
      )}

      {/* Main Responsive Work Area (Mobile & Tablet) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6">
        {/* Tab Metadata Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-400 font-mono">
              ABA ATIVA:
            </span>
            <span className="text-xs font-semibold text-white">
              {activeReport.tag ? `${activeReport.tag}` : activeReport.title}
            </span>
            {activeReport.os && (
              <span className="text-[11px] text-zinc-400 font-mono">
                (OS #{activeReport.os})
              </span>
            )}
          </div>

          <div className="text-[11px] text-zinc-400 flex items-center gap-2">
            <span>{activeReport.photos.length} evidências fotográficas</span>
            <span>•</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Salvo automaticamente
            </span>
          </div>
        </div>

        {/* Section 1: Mandatory Technical Header Form */}
        <ReportHeaderForm
          report={activeReport}
          onChange={handleUpdateActiveReport}
          showValidationErrors={showValidationErrors}
          preconfiguredEmail={settings.preconfiguredEmail}
        />

        {/* Section 2: Photographic Records (Gallery & Camera with captions) */}
        <PhotoList
          photos={activeReport.photos}
          onAddPhoto={handleAddPhoto}
          onAddMultiplePhotos={handleAddMultiplePhotos}
          onUpdatePhoto={handleUpdatePhoto}
          onDeletePhoto={handleDeletePhoto}
          onReorderPhotos={handleReorderPhotos}
          onOpenLiveCamera={() => setIsLiveCameraOpen(true)}
        />
      </main>

      {/* Sticky Bottom Action Bar for Android Mobile Devices */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-black/95 border-t border-neutral-800 p-2.5 backdrop-blur-md flex items-center justify-between gap-2">
        <button
          onClick={() => setIsLiveCameraOpen(true)}
          className="flex-1 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-amber-400 text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 border border-neutral-800"
        >
          <Camera className="w-4 h-4" />
          <span>Tirar Foto</span>
        </button>

        <button
          onClick={handleOpenExport}
          className="flex-[1.5] py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 active:scale-95 text-white text-xs font-bold shadow-lg shadow-amber-600/25 flex items-center justify-center gap-1.5 transition"
        >
          <Mail className="w-4 h-4" />
          <span>Gerar PDF & Gmail</span>
        </button>
      </div>

      {/* Live Camera Viewfinder Modal */}
      <LiveCameraModal
        isOpen={isLiveCameraOpen}
        onClose={() => setIsLiveCameraOpen(false)}
        onCapture={(dataUrl, caption) => {
          const now = new Date();
          const timeStr = `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
          handleAddPhoto({
            id: `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            dataUrl,
            caption: caption || '',
            tag: 'Inspeção',
            timestamp: timeStr,
          });
        }}
      />

      {/* PDF Export & Gmail Dispatch Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        report={activeReport}
        settings={settings}
        onOpenSettings={() => {
          setIsExportModalOpen(false);
          setIsSettingsOpen(true);
        }}
      />

      {/* Settings Modal (Configurable Email Recipient, Technician, Company) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={(newSettings) => {
          setSettings(newSettings);
          showToast('Configurações atualizadas com sucesso!', 'success');
        }}
      />
    </div>
  );
}
