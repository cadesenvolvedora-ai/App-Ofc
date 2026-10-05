import React, { useState } from 'react';
import { X, Settings, Mail, User, Building, Check, RotateCcw, Plus, Trash2 } from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  // Initialize email list from recipientEmails or preconfiguredEmail
  const [emails, setEmails] = useState<string[]>(() => {
    if (settings.recipientEmails && settings.recipientEmails.length > 0) {
      return settings.recipientEmails;
    }
    if (settings.preconfiguredEmail) {
      const parsed = settings.preconfiguredEmail
        .split(/[,;]/)
        .map((e) => e.trim())
        .filter(Boolean);
      if (parsed.length > 0) return parsed;
    }
    return ['paulo.sousa@kinross.com'];
  });

  const [newEmailInput, setNewEmailInput] = useState('');
  const [emailInputError, setEmailInputError] = useState('');
  const [techName, setTechName] = useState(settings.technicianDefaultName || 'Carlos A. Castro');
  const [company, setCompany] = useState(settings.companyName || 'Engenharia de Manutenção Industrial');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleAddEmail = () => {
    setEmailInputError('');
    if (!newEmailInput.trim()) return;

    // Support entering multiple comma-separated emails at once
    const candidates = newEmailInput
      .split(/[,;\s]+/)
      .map((e) => e.trim())
      .filter(Boolean);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidList = candidates.filter((c) => !emailRegex.test(c));

    if (invalidList.length > 0) {
      setEmailInputError(`Formato de e-mail inválido: ${invalidList.join(', ')}`);
      return;
    }

    const updated = [...emails];
    candidates.forEach((c) => {
      const lower = c.toLowerCase();
      if (!updated.map((e) => e.toLowerCase()).includes(lower)) {
        updated.push(c);
      }
    });

    setEmails(updated);
    setNewEmailInput('');
  };

  const handleRemoveEmail = (indexToRemove: number) => {
    setEmails(emails.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // If user left something in the input, try adding it
    let finalEmails = [...emails];
    if (newEmailInput.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(newEmailInput.trim())) {
        const lower = newEmailInput.trim().toLowerCase();
        if (!finalEmails.map((e) => e.toLowerCase()).includes(lower)) {
          finalEmails.push(newEmailInput.trim());
        }
      }
    }

    if (finalEmails.length === 0) {
      setEmailInputError('Adicione pelo menos um e-mail para envio dos relatórios.');
      return;
    }

    onSaveSettings({
      ...settings,
      preconfiguredEmail: finalEmails.join(', '),
      recipientEmails: finalEmails,
      technicianDefaultName: techName.trim(),
      companyName: company.trim(),
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleResetDefaults = () => {
    setEmails(['c.a.castro895@gmail.com']);
    setNewEmailInput('');
    setEmailInputError('');
    setTechName('Carlos A. Castro');
    setCompany('Engenharia de Manutenção Industrial');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="w-full max-w-lg bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl text-white">
        {/* Header */}
        <div className="px-5 py-4 bg-black border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Settings className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Configurações do Aplicativo
              </h3>
              <p className="text-[11px] text-zinc-400">
                Gerencie destinatários de e-mail e dados padrão do relatório
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-5 space-y-5">
          {/* Multiple Email Recipients Manager */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-amber-500" />
                E-mails para Recebimento dos PDFs
              </label>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-300 border border-amber-800/50">
                {emails.length} {emails.length === 1 ? 'destinatário' : 'destinatários'}
              </span>
            </div>

            <p className="text-[11px] text-zinc-400 mb-2.5">
              Inclua um ou mais e-mails. Todos serão adicionados automaticamente no Gmail ao enviar o relatório em PDF.
            </p>

            {/* Email list tags */}
            <div className="min-h-[48px] p-2 bg-black border border-neutral-800 rounded-xl mb-2 flex flex-wrap gap-1.5 items-center">
              {emails.map((em, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-900 border border-amber-500/40 text-xs font-mono text-amber-200 shadow-sm"
                >
                  <Mail className="w-3 h-3 text-amber-500 flex-shrink-0" />
                  <span className="truncate max-w-[220px]">{em}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveEmail(idx)}
                    className="p-0.5 rounded text-zinc-400 hover:text-rose-400 hover:bg-neutral-800 transition ml-0.5"
                    title={`Remover ${em}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {emails.length === 0 && (
                <span className="text-xs text-zinc-600 italic px-2">
                  Nenhum e-mail adicionado ainda. Digite abaixo para incluir.
                </span>
              )}
            </div>

            {/* Input to add new email */}
            <div className="flex gap-2">
              <input
                type="email"
                value={newEmailInput}
                onChange={(e) => {
                  setNewEmailInput(e.target.value);
                  setEmailInputError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddEmail();
                  }
                }}
                placeholder="novo.email@empresa.com"
                className="flex-1 bg-black border border-neutral-800 px-3.5 py-2 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 font-mono placeholder:text-zinc-600 transition"
              />
              <button
                type="button"
                id="btn-add-email"
                onClick={handleAddEmail}
                className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Incluir</span>
              </button>
            </div>

            {emailInputError && (
              <p className="text-[11px] text-rose-400 mt-1.5">{emailInputError}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-200 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-500" />
              Nome Padrão do Técnico Responsável
            </label>
            <input
              type="text"
              value={techName}
              onChange={(e) => setTechName(e.target.value)}
              placeholder="Nome do técnico"
              className="w-full bg-black border border-neutral-800 px-3.5 py-2 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-200 mb-1.5 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-amber-500" />
              Nome da Empresa / Departamento (Rodapé do PDF)
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Ex: Engenharia de Manutenção"
              className="w-full bg-black border border-neutral-800 px-3.5 py-2 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          {/* Android Studio Package Download Card */}
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Projeto Nativo Android Studio (APK)
              </span>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Baixe o código-fonte empacotado para compilar o APK no Android Studio.
              </p>
            </div>
            <a
              href="/relatorio-tecnico-android-studio.zip"
              download="relatorio-tecnico-android-studio.zip"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-400 text-xs font-bold border border-neutral-700 transition active:scale-95 flex-shrink-0"
            >
              <span>Baixar ZIP do Projeto</span>
            </a>
          </div>

          <div className="pt-2 flex items-center justify-between gap-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition"
            >
              <RotateCcw className="w-3 h-3" />
              Restaurar padrões
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-zinc-300 text-xs font-semibold transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                id="btn-save-settings"
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md shadow-amber-600/20 transition flex items-center gap-1.5 active:scale-95"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Salvo!</span>
                  </>
                ) : (
                  <span>Salvar Alterações</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
