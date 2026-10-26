import React, { useState, useEffect, useRef } from 'react';
import { MaintenanceReport, PhotoRecord, AppSettings } from './types';
import { createEmptyReport } from './data/sampleReport';
import { Header } from './components/Header';
import { ReportHeaderForm } from './components/ReportHeaderForm';
import { PhotoList } from './components/PhotoList';
import { ExportModal } from './components/ExportModal';
import { SettingsModal } from './components/SettingsModal';
import { 
  Image as ImageIcon, 
  Mail, 
  CheckCircle2, 
  AlertTriangle, 
  Smartphone, 
  FileCheck, 
  ShieldCheck, 
  RotateCcw 
} from 'lucide-react';
import {
  requestPersistentStorage,
  saveReportsToDB,
  loadReportsFromDB,
  saveSettingsToDB,
  loadSettingsFromDB,
  saveActiveReportIdToDB,
  loadActiveReportIdFromDB,
} from './utils/storage';

const STORAGE_KEY_REPORTS = 'ais_maintenance_reports_v3';
const STORAGE_KEY_SETTINGS = 'ais_maintenance_settings_v2';

export default function App() {
  // Load initial settings with fallback
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

  // Load reports list - Starts with synchronous localStorage cache or clean blank report
  const [reports, setReports] = useState<MaintenanceReport[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REPORTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const nonSample = parsed.filter((r: any) => r.id !== 'rep_sample_01');
          if (nonSample.length > 0) {
            return nonSample;
          }
        }
      }
    } catch (e) {
      console.error('Error loading reports from localStorage', e);
    }
    return [createEmptyReport(1)];
  });

  const [activeReportId, setActiveReportId] = useState<string>(() => {
    return reports[0]?.id || '';
  });

  // UI Modals & State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Online status for Android offline field support
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

  const [isStorageInitialized, setIsStorageInitialized] = useState(false);

  // Refs for emergency flushing on pagehide / visibilitychange / charger dock
  const reportsRef = useRef(reports);
  reportsRef.current = reports;
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const activeReportIdRef = useRef(activeReportId);
  activeReportIdRef.current = activeReportId;

  // Initialize persistent IndexedDB on startup
  useEffect(() => {
    let isMounted = true;

    async function initPersistentData() {
      // 1. Request persistent storage permission from Android/Chromium WebView
      await requestPersistentStorage();

      // 2. Load from IndexedDB
      try {
        const [dbReports, dbSettings, dbActiveId] = await Promise.all([
          loadReportsFromDB(),
          loadSettingsFromDB(),
          loadActiveReportIdFromDB(),
        ]);

        if (!isMounted) return;

        if (dbReports && Array.isArray(dbReports) && dbReports.length > 0) {
          setReports(dbReports);
          if (dbActiveId && dbReports.some((r) => r.id === dbActiveId)) {
            setActiveReportId(dbActiveId);
          } else {
            setActiveReportId(dbReports[0].id);
          }
        } else {
          // If IndexedDB was empty, seed it with initial reports
          saveReportsToDB(reportsRef.current);
        }

        if (dbSettings) {
          setSettings(dbSettings);
        } else {
          saveSettingsToDB(settingsRef.current);
        }
      } catch (err) {
        console.error('[Storage] Error during initial IndexedDB load:', err);
      } finally {
        if (isMounted) {
          setIsStorageInitialized(true);
        }
      }
    }

    initPersistentData();

    // 3. Android lifecycle event listeners: save immediately when app is paused, backgrounded, or power connected
    const flushData = () => {
      if (reportsRef.current && reportsRef.current.length > 0) {
        saveReportsToDB(reportsRef.current);
        saveSettingsToDB(settingsRef.current);
        if (activeReportIdRef.current) {
          saveActiveReportIdToDB(activeReportIdRef.current);
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flushData();
      }
    };

    window.addEventListener('beforeunload', flushData);
    window.addEventListener('pagehide', flushData);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMounted = false;
      flushData();
      window.removeEventListener('beforeunload', flushData);
      window.removeEventListener('pagehide', flushData);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Save reports to IndexedDB and fallback localStorage on state changes
  useEffect(() => {
    // Save to IndexedDB
    saveReportsToDB(reports);

    // Save lightweight fallback to localStorage
    try {
      localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(reports));
    } catch {
      // Ignore localStorage 5MB quota errors; IndexedDB handles unlimited photo storage
    }
  }, [reports]);

  // Save settings to IndexedDB and localStorage
  useEffect(() => {
    saveSettingsToDB(settings);
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch {
      // Ignore
    }
  }, [settings]);

  // Save activeReportId to IndexedDB
  useEffect(() => {
    if (activeReportId) {
      saveActiveReportIdToDB(activeReportId);
    }
  }, [activeReportId]);

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

  // Validation function: Check mandatory photo comments
  const validateReportPhotos = (report: MaintenanceReport) => {
    const missingIndices: number[] = [];
    report.photos.forEach((photo, index) => {
      if (!photo.caption || photo.caption.trim() === '') {
        missingIndices.push(index);
      }
    });

    return {
      isValid: missingIndices.length === 0,
      missingCount: missingIndices.length,
      firstMissingPhotoId: missingIndices.length > 0 ? report.photos[missingIndices[0]].id : null,
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
    const headerValidation = validateReportHeader(activeReport);
    if (!headerValidation.isValid) {
      setShowValidationErrors(true);
      showToast(
        `Preencha os campos obrigatórios do cabeçalho: ${headerValidation.missing.join(', ')}.`,
        'error'
      );
      // Scroll smoothly to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const photoValidation = validateReportPhotos(activeReport);
    if (!photoValidation.isValid) {
      setShowValidationErrors(true);
      showToast(
        `Comentários obrigatórios pendentes! ${photoValidation.missingCount} foto(s) precisam de comentário técnico antes de gerar o laudo.`,
        'error'
      );
      if (photoValidation.firstMissingPhotoId) {
        const cardEl = document.getElementById(`photo-card-${photoValidation.firstMissingPhotoId}`);
        if (cardEl) {
          cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          const inputEl = document.getElementById(`input-photo-caption-${photoValidation.firstMissingPhotoId}`);
          if (inputEl) {
            setTimeout(() => inputEl.focus(), 300);
          }
        }
      }
      return;
    }

    setShowValidationErrors(false);
    setIsExportModalOpen(true);
  };

  const headerValidation = validateReportHeader(activeReport);
  const photoValidation = validateReportPhotos(activeReport);
  const isOverallValid = headerValidation.isValid && photoValidation.isValid;

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans pb-24 sm:pb-12">
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
        hasValidationErrors={showValidationErrors && !isOverallValid}
      />

      {/* Offline Toast if field connection drops */}
      {!isOnline && (
        <div className="bg-amber-600 text-white text-xs font-semibold px-4 py-1.5 text-center flex items-center justify-center gap-2 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          <span>Modo Offline: Suas fotos e relatórios continuam sendo salvos localmente no dispositivo.</span>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-16 right-4 z-50 max-w-sm p-4 rounded-2xl shadow-xl border backdrop-blur-md flex items-center gap-3 transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
            toastMessage.type === 'error'
              ? 'bg-rose-50 border-rose-300 text-rose-900'
              : toastMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : 'bg-white border-amber-300 text-amber-950'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          )}
          <span className="text-xs font-semibold leading-snug">{toastMessage.text}</span>
        </div>
      )}

      {/* Main Responsive Work Area (Mobile & Tablet) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6">
        {/* Tab Metadata Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-700 font-mono tracking-wide">
              ABA ATIVA:
            </span>
            <span className="text-xs font-bold text-slate-900">
              {activeReport.tag ? `${activeReport.tag}` : activeReport.title}
            </span>
            {activeReport.os && (
              <span className="text-[11px] text-slate-600 font-mono font-medium">
                (OS #{activeReport.os})
              </span>
            )}
          </div>

          <div className="text-[11px] text-slate-600 flex items-center gap-2 font-medium">
            <span>{activeReport.photos.length} evidências fotográficas</span>
            <span>•</span>
            <span className="text-emerald-700 flex items-center gap-1 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
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
          settings={settings}
          onUpdateAppSettings={(newSettings) => {
            setSettings(newSettings);
            saveSettingsToDB(newSettings);
            try {
              localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(newSettings));
            } catch (e) {
              console.warn(e);
            }
          }}
        />

        {/* Section 2: Photographic Records (Gallery with mandatory captions) */}
        <PhotoList
          photos={activeReport.photos}
          onAddPhoto={handleAddPhoto}
          onAddMultiplePhotos={handleAddMultiplePhotos}
          onUpdatePhoto={handleUpdatePhoto}
          onDeletePhoto={handleDeletePhoto}
          onReorderPhotos={handleReorderPhotos}
          showValidationErrors={showValidationErrors}
        />
      </main>

      {/* Sticky Bottom Action Bar for Android Mobile Devices */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 border-t border-slate-200 p-2.5 backdrop-blur-md flex items-center justify-between gap-2 shadow-lg">
        <button
          type="button"
          onClick={() => {
            const input = document.getElementById('native-photo-gallery-input') as HTMLInputElement;
            input?.click();
          }}
          className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 border border-slate-300"
        >
          <ImageIcon className="w-4 h-4 text-amber-600" />
          <span>Galeria de Fotos</span>
        </button>

        <button
          onClick={handleOpenExport}
          className={`flex-[1.5] py-2.5 rounded-xl text-white text-xs font-bold shadow-md flex items-center justify-center gap-1.5 transition active:scale-95 ${
            showValidationErrors && !isOverallValid
              ? 'bg-amber-600 animate-pulse'
              : 'bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 shadow-amber-600/25'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Gerar PDF & Gmail</span>
        </button>
      </div>

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
