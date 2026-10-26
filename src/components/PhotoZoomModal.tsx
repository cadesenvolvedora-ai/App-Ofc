import React from 'react';
import { X, ZoomIn, Calendar, Tag, Trash2 } from 'lucide-react';
import { PhotoRecord } from '../types';

interface PhotoZoomModalProps {
  photo: PhotoRecord | null;
  onClose: () => void;
  onDelete?: (id: string) => void;
  index: number;
}

export const PhotoZoomModal: React.FC<PhotoZoomModalProps> = ({
  photo,
  onClose,
  onDelete,
  index,
}) => {
  if (!photo) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-md p-3 sm:p-6">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xl">
        {/* Top header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded bg-amber-100 text-amber-900 font-mono text-xs font-bold border border-amber-300">
              #{String(index + 1).padStart(2, '0')}
            </span>
            <span className="text-sm font-bold text-slate-900 truncate max-w-[240px] sm:max-w-md">
              Inspeção em Alta Definição
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onDelete && (
              <button
                onClick={() => {
                  onDelete(photo.id);
                  onClose();
                }}
                className="p-1.5 rounded-lg text-rose-600 hover:text-white hover:bg-rose-600 transition cursor-pointer"
                title="Apagar esta foto"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Full Image container */}
        <div className="flex-1 overflow-auto p-2 sm:p-4 flex items-center justify-center bg-slate-950">
          <img
            src={photo.dataUrl}
            alt={photo.caption || 'Foto do equipamento'}
            className="max-h-[68vh] max-w-full object-contain rounded-lg shadow-2xl"
          />
        </div>

        {/* Caption & Metadata Footer with text wrapping */}
        <div className="p-4 bg-white border-t border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              Comentário Técnico da Foto:
            </span>
            <div className="flex items-center gap-3 text-slate-600 text-xs font-mono">
              {photo.tag && (
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px] border border-slate-300 font-bold">
                  Tag: {photo.tag}
                </span>
              )}
              {photo.timestamp && <span className="font-semibold text-slate-700">{photo.timestamp}</span>}
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-900 bg-slate-50 p-3 rounded-xl border border-slate-300 leading-relaxed font-sans break-words whitespace-pre-wrap font-medium">
            {photo.caption || 'Sem comentário registrado para esta foto.'}
          </p>
        </div>
      </div>
    </div>
  );
};
