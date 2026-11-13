import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { ALL_CATEGORIES, WORD_LIBRARY } from '../data/words';
import { ZeloraLogo } from './ZeloraLogo';
import { PWAInstallButton } from './PWAInstallButton';

interface AboutScreenProps {
  onBack: () => void;
}

export const AboutScreen: React.FC<AboutScreenProps> = ({ onBack }) => {
  return (
    <div className="safe-screen flex flex-col justify-between max-w-2xl mx-auto w-full">
      <header className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] px-3 -ml-2 inline-flex items-center gap-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        <span className="text-xs font-semibold uppercase tracking-widest text-violet-400">
          About
        </span>
        <div className="w-16" aria-hidden="true" />
      </header>

      <main className="my-auto py-6">
        <div className="rounded-2xl border border-white/10 bg-[#12121A] p-7 sm:p-10 text-center space-y-6">
          <ZeloraLogo size="md" showWordmark />

          <p className="text-sm sm:text-base text-zinc-300 max-w-md mx-auto leading-relaxed">
            Think Carefully. Speak Wisely. Find the Imposter.
          </p>

          <dl className="text-left text-sm space-y-3 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-white/8">
              <dt className="text-zinc-400">Developer</dt>
              <dd className="font-semibold text-white">Zelora</dd>
            </div>
            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-white/8">
              <dt className="text-zinc-400">Version</dt>
              <dd className="font-mono font-semibold text-violet-300">1.0.0</dd>
            </div>
            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-white/8">
              <dt className="text-zinc-400">Play Mode</dt>
              <dd className="font-semibold text-white">
                Offline Pass &amp; Play
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-white/8">
              <dt className="text-zinc-400">Players</dt>
              <dd className="font-mono font-semibold text-white tabular-nums">
                3 – 20 Players
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-zinc-400">Word Library</dt>
              <dd className="font-mono font-semibold text-white tabular-nums">
                {WORD_LIBRARY.length} Words · {ALL_CATEGORIES.length} Categories
              </dd>
            </div>
          </dl>

          <p className="text-xs text-zinc-500 leading-relaxed">
            Built to run completely offline on your phone. Scores and settings stay
            on your device.
          </p>

          <div className="pt-2">
            <PWAInstallButton />
          </div>
        </div>
      </main>

      <footer className="pb-2 text-center text-xs text-zinc-500">
        Developed by Zelora · v1.0.0
      </footer>
    </div>
  );
};
