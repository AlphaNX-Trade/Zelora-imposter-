import React, { useState } from 'react';
import { Download, Share, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({
  compact = false,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) return null;

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className={`inline-flex items-center justify-center gap-2 rounded-xl border border-violet-500/40 bg-violet-500/10 text-violet-200 hover:bg-violet-500/20 active:scale-[0.98] transition-all font-medium whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${
          compact ? 'min-h-[44px] px-4 text-sm' : 'w-full min-h-[48px] px-5 text-sm'
        }`}
      >
        <Download className="w-4 h-4 shrink-0" />
        Install App for Offline Play
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className={`inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] text-zinc-200 hover:bg-white/[0.08] active:scale-[0.98] transition-all font-medium whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${
            compact ? 'min-h-[44px] px-4 text-sm' : 'w-full min-h-[48px] px-5 text-sm'
          }`}
        >
          <Share className="w-4 h-4 shrink-0 text-violet-400" />
          Install on iPhone / iPad
        </button>

        {showIOSGuide && (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ios-install-title"
          >
            <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#14141D] p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3
                  id="ios-install-title"
                  className="font-display text-lg font-bold text-white"
                >
                  Install Zelora Imposter
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 cursor-pointer"
                  aria-label="Close install instructions"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <ol className="mt-4 space-y-3 text-sm text-zinc-300 leading-relaxed">
                <li>
                  1. Tap the <strong className="text-white">Share</strong> icon in
                  Safari&apos;s toolbar.
                </li>
                <li>
                  2. Scroll down and tap{' '}
                  <strong className="text-white">Add to Home Screen</strong>.
                </li>
                <li>
                  3. Tap <strong className="text-white">Add</strong> to launch
                  100% offline anytime.
                </li>
              </ol>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full min-h-[48px] rounded-xl bg-violet-600 text-sm font-semibold text-white hover:bg-violet-500 transition-colors cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
