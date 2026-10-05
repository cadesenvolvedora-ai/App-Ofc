import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, RefreshCw, Zap, Check, Sparkles, AlertCircle } from 'lucide-react';

interface LiveCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (dataUrl: string, initialCaption?: string) => void;
}

const CAMERA_QUICK_SUGGESTIONS = [
  'Inspeção visual do equipamento',
  'Desmontagem do conjunto',
  'Rolamento com avaria',
  'Desgaste e folga mecânica',
  'Limpeza e descontaminação',
  'Montagem final concluída',
];

export const LiveCameraModal: React.FC<LiveCameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasTorch, setHasTorch] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [quickCaption, setQuickCaption] = useState('');
  const [captionError, setCaptionError] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Start camera stream
  const startCamera = async () => {
    setIsLoading(true);
    setCameraError(null);

    // Stop previous stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    try {
      const constraints: MediaStreamConstraints = {
        audio: false,
        video: {
          facingMode: { ideal: facingMode },
          // Maximum sensor quality requested
          width: { ideal: 4096, min: 1280 },
          height: { ideal: 2160, min: 720 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Check torch capability
      const videoTrack = stream.getVideoTracks()[0];
      const capabilities = (videoTrack.getCapabilities ? videoTrack.getCapabilities() : {}) as any;
      if (capabilities.torch) {
        setHasTorch(true);
      } else {
        setHasTorch(false);
      }
      setIsLoading(false);
    } catch (err: any) {
      console.error('Error opening camera stream:', err);
      setCameraError('Não foi possível acessar a câmera do dispositivo diretamente. Use o botão "Câmera Nativa" ou verifique as permissões.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      // Clean up stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      setCapturedImage(null);
      setQuickCaption('');
      setCaptionError('');
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [isOpen, facingMode]);

  // Toggle Torch/Flashlight
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    try {
      await (track as any).applyConstraints({
        advanced: [{ torch: !torchOn }],
      });
      setTorchOn(!torchOn);
    } catch (err) {
      console.warn('Torch not supported on this track', err);
    }
  };

  // Flip camera between rear and front
  const flipCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Capture current frame at full video stream resolution
  const takeSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1920;
    canvas.height = video.videoHeight || 1080;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Highest quality draw
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const fullResDataUrl = canvas.toDataURL('image/jpeg', 0.98);
    setCapturedImage(fullResDataUrl);
  };

  const handleConfirmPhoto = () => {
    if (!capturedImage) return;
    if (!quickCaption || quickCaption.trim() === '') {
      setCaptionError('O comentário desta foto é obrigatório. Digite uma descrição ou selecione uma das sugestões abaixo.');
      return;
    }
    onCapture(capturedImage, quickCaption.trim());
    setQuickCaption('');
    setCaptionError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4">
      <div className="relative w-full max-w-2xl bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[96vh]">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-black border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-bold text-white">
              Câmera Técnica de Alta Qualidade
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder / Preview Area */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[360px] sm:min-h-[440px]">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 gap-2">
              <RefreshCw className="w-8 h-8 animate-spin text-amber-400" />
              <span className="text-xs">Iniciando sensor óptico...</span>
            </div>
          )}

          {cameraError ? (
            <div className="p-6 text-center text-rose-300 text-xs sm:text-sm max-w-md">
              <p className="mb-4">{cameraError}</p>
              <button
                onClick={startCamera}
                className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition border border-neutral-800"
              >
                Tentar Novamente
              </button>
            </div>
          ) : capturedImage ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={capturedImage}
                alt="Foto Capturada"
                className="max-h-[60vh] object-contain rounded-lg shadow-lg"
              />
              <div className="absolute top-3 left-3 bg-black/70 px-2.5 py-1 rounded-full text-[11px] text-amber-300 font-mono flex items-center gap-1.5 border border-amber-500/30">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Resolução Máxima Capturada
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                playsInline
                autoPlay
                muted
                className="w-full h-full object-contain"
              />
              {/* Center target guide */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 sm:w-64 sm:h-64 border-2 border-amber-400/40 rounded-xl relative">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-amber-400" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-amber-400" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-amber-400" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-amber-400" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Controls */}
        <div className="p-4 bg-black border-t border-neutral-800">
          {capturedImage ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span>Comentário Técnico da Foto</span>
                    <span className="text-rose-400 font-bold">*</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-900 text-rose-300 font-mono border border-rose-800/40">
                      Obrigatório
                    </span>
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    Aparecerá no laudo PDF
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="Digite o comentário desta foto (ex: Mancal com folga e oxidação)..."
                  value={quickCaption}
                  onChange={(e) => {
                    setQuickCaption(e.target.value);
                    if (captionError) setCaptionError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleConfirmPhoto();
                    }
                  }}
                  className={`w-full bg-neutral-900 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-zinc-600 focus:outline-none transition break-words border ${
                    captionError
                      ? 'border-rose-500 bg-rose-950/20 focus:border-rose-400'
                      : 'border-neutral-800 focus:border-amber-500'
                  }`}
                />
                {captionError && (
                  <p className="text-[11px] text-rose-400 font-medium flex items-center gap-1 mt-1.5">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{captionError}</span>
                  </p>
                )}
              </div>

              {/* Quick suggestions to make comment entry effortless */}
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block mb-1">
                  Sugestões Rápidas (Toque para preencher):
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto no-scrollbar">
                  {CAMERA_QUICK_SUGGESTIONS.map((sugg) => (
                    <button
                      key={sugg}
                      type="button"
                      onClick={() => {
                        setQuickCaption(sugg);
                        if (captionError) setCaptionError('');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 active:scale-95 text-zinc-300 text-[11px] border border-neutral-800 transition text-left"
                    >
                      + {sugg}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setCapturedImage(null);
                    setCaptionError('');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-zinc-300 text-xs sm:text-sm font-semibold border border-neutral-800 transition"
                >
                  Tirar Outra
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPhoto}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-amber-600/20 transition flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Salvar Foto & Comentário
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4">
              {/* Torch Button */}
              {hasTorch ? (
                <button
                  onClick={toggleTorch}
                  className={`p-3 rounded-xl border transition ${
                    torchOn
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-neutral-900 border-neutral-800 text-zinc-400 hover:text-white'
                  }`}
                  title="Lanterna / Flash"
                >
                  <Zap className="w-5 h-5" />
                </button>
              ) : (
                <div className="w-11" />
              )}

              {/* Shutter Button */}
              <button
                id="btn-shutter-capture"
                onClick={takeSnapshot}
                disabled={isLoading || !!cameraError}
                className="h-16 w-16 rounded-full border-4 border-white bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 active:scale-90 transition shadow-xl flex items-center justify-center text-white disabled:opacity-50"
                title="Capturar Foto"
              >
                <Camera className="w-7 h-7" />
              </button>

              {/* Flip camera button */}
              <button
                onClick={flipCamera}
                className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-zinc-400 hover:text-white transition"
                title="Trocar Câmera (Traseira / Frontal)"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
