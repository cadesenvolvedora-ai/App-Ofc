import React, { useRef, useState } from 'react';
import { 
  Camera, 
  Image as ImageIcon, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  ZoomIn, 
  Clock, 
  Plus, 
  Sparkles, 
  AlertCircle,
  CheckCircle2,
  Tag as TagIcon
} from 'lucide-react';
import { PhotoRecord } from '../types';
import { readFileAsDataURL } from '../utils/imageUtils';
import { PhotoZoomModal } from './PhotoZoomModal';

interface PhotoListProps {
  photos: PhotoRecord[];
  onAddPhoto: (photo: PhotoRecord) => void;
  onAddMultiplePhotos: (photos: PhotoRecord[]) => void;
  onUpdatePhoto: (id: string, updated: Partial<PhotoRecord>) => void;
  onDeletePhoto: (id: string) => void;
  onReorderPhotos: (startIndex: number, endIndex: number) => void;
  onOpenLiveCamera: () => void;
  showValidationErrors?: boolean;
}

const COMMON_TAGS = ['Antes', 'Durante', 'Avaria', 'Depois', 'Inspeção', 'Montagem'];

const QUICK_SUGGESTIONS = [
  'Acoplamento danificado',
  'Graxa sólida obstruindo canal de lubrificação',
  'Rolamentos LOA com contaminação',
  'Isolamento da tampa LOA danificado.',
  'Mancal LOA desmontado',
  'Flag da base do motor antes',
  'Mola do expurgo montado errado',
  'Testes dielétricos conforme tabela WEG',
  'Desgaste por atrito mecânico',
  'Limpeza e descontaminação concluída',
];

export const PhotoList: React.FC<PhotoListProps> = ({
  photos,
  onAddPhoto,
  onAddMultiplePhotos,
  onUpdatePhoto,
  onDeletePhoto,
  onReorderPhotos,
  onOpenLiveCamera,
  showValidationErrors = false,
}) => {
  const photoGalleryInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedPhotoForZoom, setSelectedPhotoForZoom] = useState<{
    photo: PhotoRecord;
    index: number;
  } | null>(null);

  const [photoToDelete, setPhotoToDelete] = useState<PhotoRecord | null>(null);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);

  // Compute pending mandatory captions
  const pendingCaptionsCount = photos.filter((p) => !p.caption || p.caption.trim() === '').length;

  // Handle Gallery / System Photo Picker Files (Supports single or multiple images!)
  const handlePhotoGalleryFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessingFiles(true);
    const newRecords: PhotoRecord[] = [];

    const now = new Date();
    const timeStr = `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const dataUrl = await readFileAsDataURL(file);
        if (dataUrl && dataUrl.startsWith('data:image/')) {
          newRecords.push({
            id: `p_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`,
            dataUrl,
            caption: '',
            tag: 'Inspeção',
            timestamp: timeStr,
          });
        }
      } catch (err) {
        console.error('Error reading photo from gallery:', err);
        // Direct FileReader fallback if custom reader failed
        try {
          const directReader = new FileReader();
          const fallbackDataUrl = await new Promise<string>((resolve, reject) => {
            directReader.onload = () => resolve(directReader.result as string);
            directReader.onerror = reject;
            directReader.readAsDataURL(file);
          });
          if (fallbackDataUrl) {
            newRecords.push({
              id: `p_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`,
              dataUrl: fallbackDataUrl,
              caption: '',
              tag: 'Inspeção',
              timestamp: timeStr,
            });
          }
        } catch (fallbackErr) {
          console.error('Fallback read also failed:', fallbackErr);
        }
      }
    }

    if (newRecords.length === 1) {
      onAddPhoto(newRecords[0]);
    } else if (newRecords.length > 1) {
      onAddMultiplePhotos(newRecords);
    }

    setIsProcessingFiles(false);
    if (photoGalleryInputRef.current) photoGalleryInputRef.current.value = '';
  };

  return (
    <div className="space-y-4">
      {/* Hidden File Input for Gallery / System Photo Picker */}
      <input
        ref={photoGalleryInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onClick={(e) => {
          // Reset value on click so selecting the same photo or reopening works every time
          (e.target as HTMLInputElement).value = '';
        }}
        onChange={handlePhotoGalleryFiles}
      />

      {/* Action Header Card */}
      <div className="bg-black border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Evidências Fotográficas da Manutenção
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-xs font-bold border border-amber-500/30">
              {photos.length} {photos.length === 1 ? 'foto' : 'fotos'}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Tire fotos ao vivo com a câmera do app ou selecione diretamente da galeria do aparelho.
          </p>
        </div>

        {/* Buttons to Add Photos */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* In-App Live Camera Button */}
          <button
            type="button"
            id="btn-open-live-camera"
            onClick={onOpenLiveCamera}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-amber-600/20 transition"
            title="Tirar foto usando o visor ao vivo no aplicativo"
          >
            <Camera className="w-4 h-4" />
            <span>Tirar Foto (App)</span>
          </button>

          {/* Galeria de Fotos (Renomeado da Câmera Nativa, botão funcional no Tablet) */}
          <button
            type="button"
            id="btn-photo-gallery"
            onClick={() => photoGalleryInputRef.current?.click()}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 active:scale-95 text-amber-300 text-xs sm:text-sm font-bold border border-amber-500/30 shadow-md transition"
            title="Selecionar fotos da galeria do tablet ou celular"
          >
            <ImageIcon className="w-4 h-4 text-amber-400" />
            <span>Galeria de Fotos</span>
          </button>
        </div>
      </div>

      {isProcessingFiles && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
          <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <span>Processando imagens em resolução máxima...</span>
        </div>
      )}

      {/* Mandatory Comments Warning / Success Status Banner */}
      {photos.length > 0 && (
        <div className={`p-3.5 sm:p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
          pendingCaptionsCount > 0
            ? showValidationErrors
              ? 'bg-rose-950/70 border-rose-500/80 text-rose-200 shadow-lg shadow-rose-950/40 ring-1 ring-rose-500/40'
              : 'bg-amber-950/50 border-amber-600/50 text-amber-200 shadow-md'
            : 'bg-emerald-950/50 border-emerald-600/40 text-emerald-200'
        }`}>
          <div className="flex items-center gap-2.5">
            {pendingCaptionsCount > 0 ? (
              <AlertCircle className={`w-5 h-5 flex-shrink-0 ${showValidationErrors ? 'text-rose-400 animate-bounce' : 'text-amber-400'}`} />
            ) : (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold tracking-tight">
                  {pendingCaptionsCount > 0
                    ? `Obrigatoriedade: ${pendingCaptionsCount} foto(s) sem comentário técnico`
                    : 'Todas as fotos possuem comentários obrigatórios preenchidos!'}
                </span>
                {pendingCaptionsCount > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-black/60 border border-current">
                    {photos.length - pendingCaptionsCount} de {photos.length}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-300 mt-0.5">
                {pendingCaptionsCount > 0
                  ? 'Cada foto precisa obrigatoriamente de um comentário descritivo antes da emissão do PDF e envio no Gmail.'
                  : 'Documentação fotográfica completa e validada para emissão do laudo técnico.'}
              </p>
            </div>
          </div>

          {pendingCaptionsCount > 0 && (
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg self-start sm:self-auto border ${
              showValidationErrors
                ? 'bg-rose-900/80 text-rose-200 border-rose-500'
                : 'bg-amber-900/80 text-amber-200 border-amber-700/60'
            }`}>
              {showValidationErrors ? 'Preenchimento Obrigatório' : 'Pendente de Comentário'}
            </span>
          )}
        </div>
      )}

      {/* Empty State */}
      {photos.length === 0 && (
        <div className="bg-neutral-950 border-2 border-dashed border-neutral-800 rounded-2xl p-8 sm:p-12 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-neutral-900 flex items-center justify-center text-zinc-400 mb-3">
            <Camera className="w-7 h-7 text-amber-400" />
          </div>
          <h4 className="text-base font-bold text-white mb-1">
            Nenhuma foto adicionada neste relatório
          </h4>
          <p className="text-xs text-zinc-400 max-w-md mx-auto mb-6 leading-relaxed">
            Adicione fotos da desmontagem, avarias encontradas, peças substituídas ou medições para compor o relatório técnico.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onOpenLiveCamera}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white text-xs sm:text-sm font-bold shadow-md transition"
            >
              <Camera className="w-4 h-4" />
              Tirar Foto Agora
            </button>
            <button
              type="button"
              onClick={() => photoGalleryInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-amber-300 text-xs sm:text-sm font-bold border border-amber-500/30 transition shadow"
            >
              <ImageIcon className="w-4 h-4 text-amber-400" />
              Galeria de Fotos
            </button>
          </div>
        </div>
      )}

      {/* Photo Cards Grid (Optimized for Android Phone & Tablet) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {photos.map((photo, index) => {
          const isCaptionMissing = !photo.caption || photo.caption.trim() === '';

          return (
            <div
              key={photo.id}
              id={`photo-card-${photo.id}`}
              className={`bg-neutral-950 rounded-2xl overflow-hidden shadow-lg transition-all flex flex-col border ${
                isCaptionMissing && showValidationErrors
                  ? 'border-rose-500 shadow-rose-950/50 ring-1 ring-rose-500/50'
                  : isCaptionMissing
                  ? 'border-amber-900/60 hover:border-amber-500/60'
                  : 'border-neutral-800 hover:border-emerald-600/50'
              }`}
            >
              {/* Card Header with Item #, Tag, Reorder & Delete */}
              <div className="px-4 py-2.5 bg-black border-b border-neutral-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-xs font-bold border border-amber-500/30">
                    Item #{String(index + 1).padStart(2, '0')}
                  </span>

                  {/* Status Tag indicating mandatory completion */}
                  {isCaptionMissing ? (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 ${
                      showValidationErrors
                        ? 'bg-rose-950/90 text-rose-300 border-rose-500 animate-pulse'
                        : 'bg-amber-950/70 text-amber-300 border-amber-700/60'
                    }`}>
                      <AlertCircle className="w-3 h-3 text-rose-400" />
                      <span>Comentário Obrigatório *</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/70 text-emerald-300 border border-emerald-700/60 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Comentado</span>
                    </span>
                  )}

                  {/* Tag selector */}
                  <select
                    value={photo.tag || 'Inspeção'}
                    onChange={(e) => onUpdatePhoto(photo.id, { tag: e.target.value })}
                    className="bg-neutral-900 text-zinc-300 border border-neutral-800 text-[11px] rounded-lg px-2 py-1 font-medium focus:outline-none focus:border-amber-500"
                  >
                    {COMMON_TAGS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Action buttons (Move Up, Move Down, Zoom, Delete) */}
                <div className="flex items-center gap-1">
                  {/* Reorder Up */}
                  <button
                    disabled={index === 0}
                    onClick={() => onReorderPhotos(index, index - 1)}
                    className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition"
                    title="Mover foto para cima"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>

                  {/* Reorder Down */}
                  <button
                    disabled={index === photos.length - 1}
                    onClick={() => onReorderPhotos(index, index + 1)}
                    className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition"
                    title="Mover foto para baixo"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {/* Delete Photo */}
                  <button
                    id={`btn-delete-photo-${photo.id}`}
                    onClick={() => setPhotoToDelete(photo)}
                    className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition ml-1"
                    title="Apagar esta foto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Photo Visual Area */}
              <div 
                className="relative bg-black group cursor-pointer aspect-[4/3] flex items-center justify-center overflow-hidden"
                onClick={() => setSelectedPhotoForZoom({ photo, index })}
              >
                <img
                  src={photo.dataUrl}
                  alt={photo.caption || `Foto #${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  loading="lazy"
                />

                {/* Hover/Tap Zoom overlay badge */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-semibold backdrop-blur-[2px]">
                  <ZoomIn className="w-5 h-5" />
                  <span>Toque para inspecionar</span>
                </div>

                {/* Timestamp badge */}
                {photo.timestamp && (
                  <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] text-zinc-300 font-mono flex items-center gap-1 border border-neutral-800">
                    <Clock className="w-3 h-3 text-amber-400" />
                    {photo.timestamp}
                  </div>
                )}
              </div>

              {/* Comment Section Below Photo */}
              <div className="p-3.5 sm:p-4 bg-neutral-950 flex-1 flex flex-col justify-between">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span>Comentário Técnico da Foto</span>
                      <span className="text-rose-400 font-bold">*</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono border ${
                        isCaptionMissing
                          ? 'bg-rose-950/70 text-rose-300 border-rose-800/80 font-bold'
                          : 'bg-emerald-950/70 text-emerald-300 border-emerald-800/80'
                      }`}>
                        {isCaptionMissing ? 'Obrigatório' : 'Preenchido'}
                      </span>
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      Aparecerá no PDF abaixo da imagem
                    </span>
                  </label>

                  <textarea
                    id={`input-photo-caption-${photo.id}`}
                    rows={2}
                    value={photo.caption}
                    onChange={(e) => onUpdatePhoto(photo.id, { caption: e.target.value })}
                    placeholder="Digite obrigatoriamente o comentário (ex: Mancal com avaria no rolamento, mola montada invertida...)"
                    className={`w-full bg-black rounded-xl px-3 py-2 text-xs sm:text-sm text-white placeholder:text-zinc-600 focus:outline-none transition leading-relaxed resize-y break-words whitespace-pre-wrap border ${
                      isCaptionMissing && showValidationErrors
                        ? 'border-rose-500 focus:border-rose-400 bg-rose-950/20'
                        : isCaptionMissing
                        ? 'border-neutral-800 focus:border-amber-500'
                        : 'border-neutral-800 focus:border-emerald-500'
                    }`}
                  />

                  {isCaptionMissing && (
                    <p className={`text-[11px] mt-1.5 flex items-center gap-1 font-medium ${
                      showValidationErrors ? 'text-rose-400' : 'text-amber-400/90'
                    }`}>
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-rose-400" />
                      <span>Obrigatório preencher o comentário técnico desta foto para liberar o laudo.</span>
                    </p>
                  )}
                </div>

                {/* Quick Snippet Chips to speed up technicians' typing on mobile */}
                <div className="mt-2.5">
                  <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                    Sugestões Rápidas:
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto no-scrollbar">
                    {QUICK_SUGGESTIONS.slice(0, 4).map((sugg) => (
                      <button
                        key={sugg}
                        type="button"
                        onClick={() => {
                          const newText = photo.caption
                            ? `${photo.caption} - ${sugg}`
                            : sugg;
                          onUpdatePhoto(photo.id, { caption: newText });
                        }}
                        className="px-2 py-0.5 rounded-md bg-neutral-900 hover:bg-neutral-800 text-zinc-300 text-[10px] transition truncate max-w-[200px] border border-neutral-800"
                        title={sugg}
                      >
                        + {sugg}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      {photoToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-black border border-neutral-800 p-5 shadow-2xl text-white">
            <div className="flex items-center gap-3 mb-3 text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">
                Apagar Evidência Fotográfica?
              </h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              Esta ação removerá a imagem e seu comentário do relatório técnico. Deseja prosseguir?
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPhotoToDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-zinc-300 text-xs font-semibold border border-neutral-800 transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onDeletePhoto(photoToDelete.id);
                  setPhotoToDelete(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-lg"
              >
                Sim, Apagar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Zoom / Fullscreen Modal */}
      {selectedPhotoForZoom && (
        <PhotoZoomModal
          photo={selectedPhotoForZoom.photo}
          index={selectedPhotoForZoom.index}
          onClose={() => setSelectedPhotoForZoom(null)}
          onDelete={(id) => {
            onDeletePhoto(id);
            setSelectedPhotoForZoom(null);
          }}
        />
      )}
    </div>
  );
};
