import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  installLabel: string;
  installIOSLabel: string;
  onOpenStoreGuide?: () => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  installLabel,
  installIOSLabel,
  onOpenStoreGuide,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="inline-flex items-center gap-2 rounded-full border border-sky-400/75 bg-sky-500/20 px-4 py-2 text-xs font-semibold text-sky-950 backdrop-blur-md shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-sky-500/35 hover:border-sky-500 hover:shadow-[0_6px_20px_rgba(2,132,199,0.25)] active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 whitespace-nowrap shrink-0"
      >
        <Download className="h-3.5 w-3.5" aria-hidden="true" />
        <span>{installLabel}</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowGuide(true)}
          className="inline-flex items-center gap-2 rounded-full border border-sky-400/75 bg-sky-500/20 px-4 py-2 text-xs font-semibold text-sky-950 backdrop-blur-md shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-sky-500/35 hover:border-sky-500 hover:shadow-[0_6px_20px_rgba(2,132,199,0.25)] active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 whitespace-nowrap shrink-0"
        >
          <Smartphone className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{installIOSLabel}</span>
        </button>

        {showGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="ios-install-title">
            <div className="w-full max-w-sm rounded-2xl border border-white/70 bg-white/80 p-6 shadow-2xl backdrop-blur-xl">
              <div className="flex items-start justify-between gap-4">
                <h3 id="ios-install-title" className="text-lg font-semibold text-slate-900">
                  Install on iPhone / iPad
                </h3>
                <button
                  type="button"
                  onClick={() => setShowGuide(false)}
                  className="rounded-full border border-white/70 bg-white/30 p-1.5 text-slate-600 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/70 hover:text-slate-900 hover:shadow-sm active:scale-95"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <ol className="mt-3 space-y-2 text-sm text-slate-700">
                <li>1. Tap the <strong>Share</strong> icon in Safari at the bottom of your screen.</li>
                <li>2. Scroll down and tap <strong>Add to Home Screen</strong>.</li>
                <li>3. Tap <strong>Add</strong> to launch HARRBOTIX like a native app offline.</li>
              </ol>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="mt-5 w-full rounded-full border border-sky-400/70 bg-sky-500/20 px-4 py-2.5 text-xs font-semibold text-sky-950 backdrop-blur-md shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-sky-500/35 hover:border-sky-500 hover:shadow-[0_6px_18px_rgba(2,132,199,0.22)] active:scale-95"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <button
      type="button"
      onClick={onOpenStoreGuide}
      className="inline-flex items-center gap-2 rounded-full border border-sky-400/75 bg-sky-500/20 px-4 py-2 text-xs font-semibold text-sky-950 backdrop-blur-md shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-sky-500/35 hover:border-sky-500 hover:shadow-[0_6px_20px_rgba(2,132,199,0.25)] active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 whitespace-nowrap shrink-0"
    >
      <Download className="h-3.5 w-3.5" aria-hidden="true" />
      <span>{installLabel}</span>
    </button>
  );
};
