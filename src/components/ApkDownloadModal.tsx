import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Download, 
  Copy, 
  Check, 
  ExternalLink, 
  QrCode, 
  ShieldCheck, 
  Zap, 
  WifiOff, 
  Camera,
  FolderArchive,
  Terminal
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface ApkDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkDownloadModal: React.FC<ApkDownloadModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, install, isIOS } = usePWAInstall();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Deployed / preview URL of the app
  const appUrl = window.location.href.split('?')[0];
  const pwaBuilderUrl = `https://www.pwabuilder.com/report?url=${encodeURIComponent(appUrl)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(appUrl)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden my-6 text-slate-900">
        {/* Modal Header */}
        <div className="bg-slate-50 px-6 py-4 flex items-center justify-between text-slate-900 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/15 flex items-center justify-center backdrop-blur-sm border border-amber-300">
              <Smartphone className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Instalar no Android & Baixar APK
              </h2>
              <p className="text-xs text-slate-600">
                Aplicativo para Celular e Tablet com suporte offline e câmera HD
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-slate-800 text-sm max-h-[80vh] overflow-y-auto bg-white">
          {/* Option: Download ZIP for Android Studio */}
          <div className="rounded-xl bg-amber-50/60 border-2 border-amber-300 p-4 relative overflow-hidden shadow-xs">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-200 text-amber-900 border border-amber-400">
                <FolderArchive className="w-3.5 h-3.5 text-amber-800" /> CÓDIGO COMPLETO + ANDROID STUDIO
              </span>
              <span className="text-[11px] text-amber-900 font-mono font-bold">Arquivo .ZIP</span>
            </div>

            <h3 className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-2">
              Baixar Projeto Android Studio 100% Offline (Android Puro)
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed mb-3">
              O projeto agora possui <strong>todos os arquivos HTML, scripts, estilos e recursos embutidos diretamente dentro do APK</strong> (pasta <code>assets/</code>). O aplicativo funciona de forma 100% autônoma e offline no celular, sem abrir URLs externas e sem perigo de "page not found".
            </p>

            <a
              href="/relatorio-tecnico-android-studio.zip"
              download="relatorio-tecnico-android-studio.zip"
              className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-600/20 transition active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Baixar Arquivo ZIP Agora (Código + Android Studio)</span>
            </a>

            <div className="mt-3 bg-white rounded-lg p-3 border border-amber-200 text-xs space-y-1.5">
              <p className="font-bold text-amber-900 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-amber-700" />
                Passo a passo no Android Studio:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-slate-700 text-[11px] font-medium">
                <li>Baixe o ZIP e extraia a pasta no seu computador.</li>
                <li>No Android Studio, clique em <strong>File &gt; Open</strong> e selecione a pasta <strong>android-studio-project</strong>.</li>
                <li>Aguarde o Gradle sincronizar as dependências.</li>
                <li>Vá no menu superior: <strong>Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</strong>.</li>
                <li>Pronto! O arquivo <code>app-debug.apk</code> será gerado na pasta <code>app/build/outputs/apk/debug/</code>.</li>
              </ol>
            </div>
          </div>

          {/* Method 1: Direct Android Installation (PWA / Recommended) */}
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 relative overflow-hidden">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                <Zap className="w-3.5 h-3.5 text-amber-700" /> MÉTODO 1 (MAIS RÁPIDO & RECOMENDADO)
              </span>
              <span className="text-[11px] text-slate-600 font-semibold">Instalação Instantânea</span>
            </div>

            <h3 className="font-bold text-slate-900 text-sm mb-1">
              Instalar Direto no Android (Sem precisar baixar arquivo .APK)
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed mb-3">
              O app é um PWA (Progressive Web App) totalmente compatível com Android. Ele cria o ícone na tela inicial, roda em tela cheia sem barras de navegador e armazena os dados offline.
            </p>

            {isInstallable && !isInstalled ? (
              <button
                onClick={async () => {
                  await install();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-600/20 transition active:scale-95 cursor-pointer"
              >
                <Smartphone className="w-4 h-4" />
                Instalar Aplicativo Agora no Dispositivo
              </button>
            ) : isInstalled ? (
              <div className="py-2 px-3 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2 font-bold">
                <Check className="w-4 h-4 text-emerald-600" />
                Este aplicativo já está instalado e rodando em modo nativo no seu dispositivo!
              </div>
            ) : (
              <div className="space-y-2 bg-white rounded-lg p-3 border border-slate-200 text-xs">
                <p className="font-bold text-slate-900">Como instalar no Google Chrome do celular/tablet:</p>
                <ol className="list-decimal list-inside space-y-1 text-slate-700 font-medium">
                  <li>Abra o link deste aplicativo no navegador <strong>Google Chrome</strong></li>
                  <li>Toque no menu de <strong>3 pontinhos (⋮)</strong> no topo direito</li>
                  <li>Selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong></li>
                  <li>Confirme o nome e toque em <strong>Instalar</strong></li>
                </ol>
              </div>
            )}
          </div>

          {/* Method 2: Generate and Download .APK package via PWABuilder */}
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                <Download className="w-3.5 h-3.5 text-amber-700" /> MÉTODO 2: PACOTE .APK NATIVO
              </span>
              <span className="text-[11px] text-slate-600 font-semibold">Arquivo instalador .apk</span>
            </div>

            <h3 className="font-bold text-slate-900 text-sm mb-1">
              Gerar Pacote APK para Download (PWABuilder)
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed mb-3">
              Como o aplicativo já possui todos os manifestos e ícones nativos Android configurados, você pode gerar o arquivo <strong>.apk</strong> empacotado para instalação direta no Android através do PWABuilder (ferramenta oficial da Microsoft para empacotamento Android):
            </p>

            <a
              href={pwaBuilderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition active:scale-95 shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4 text-amber-600" />
              <span>Gerar & Baixar APK no PWABuilder</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </a>

            <p className="text-[11px] text-slate-500 mt-2 text-center font-medium">
              Na página do PWABuilder, clique em <strong>"Package for Android"</strong> &rarr; <strong>"Download Package"</strong> para baixar o .apk.
            </p>
          </div>

          {/* QR Code & Direct Link */}
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-amber-700" />
              Abrir no Celular ou Tablet Android
            </h4>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="p-2 bg-white rounded-xl shadow-xs border border-slate-200 flex-shrink-0">
                <img
                  src={qrCodeUrl}
                  alt="QR Code do App para Celular"
                  className="w-28 h-28"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="space-y-2 text-xs text-slate-700 w-full">
                <p className="font-medium">
                  Aponte a câmera do seu celular Android para o QR Code ao lado para abrir o app diretamente no aparelho.
                </p>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={appUrl}
                    className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 select-all font-mono font-medium"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="p-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 transition flex-shrink-0 border border-slate-300 shadow-xs cursor-pointer"
                    title="Copiar Link"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                {copied && (
                  <p className="text-[11px] text-emerald-700 font-bold">Link copiado para a área de transferência!</p>
                )}
              </div>
            </div>
          </div>

          {/* Native Features summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
            <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200 flex items-center gap-2">
              <Camera className="w-4 h-4 text-amber-700 flex-shrink-0" />
              <span className="text-slate-800 font-medium">Câmera HD com flash e resolução máxima</span>
            </div>
            <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200 flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-amber-700 flex-shrink-0" />
              <span className="text-slate-800 font-medium">Suporte offline sem perder relatórios</span>
            </div>
            <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-700 flex-shrink-0" />
              <span className="text-slate-800 font-medium">PDFs e Planilhas salvos localmente</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold text-xs transition shadow-xs cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
