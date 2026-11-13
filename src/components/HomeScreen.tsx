import React from 'react';
import {
  BookOpen,
  Info,
  Play,
  RotateCcw,
  Settings,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { ZeloraLogo } from './ZeloraLogo';
import { PWAInstallButton } from './PWAInstallButton';

interface HomeScreenProps {
  hasActiveSession: boolean;
  activeRound: number;
  activePlayerCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onPlayGame: () => void;
  onResumeGame: () => void;
  onHowToPlay: () => void;
  onSettings: () => void;
  onAbout: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  hasActiveSession,
  activeRound,
  activePlayerCount,
  soundEnabled,
  onToggleSound,
  onPlayGame,
  onResumeGame,
  onHowToPlay,
  onSettings,
  onAbout,
}) => {
  return (
    <div className="safe-screen flex flex-col justify-between max-w-5xl mx-auto w-full relative">
      {/* Top bar */}
      <header className="flex items-center justify-between gap-4">
        <span className="text-xs font-medium tracking-[0.18em] uppercase text-zinc-500">
          Pass &amp; Play · 3–20 Players
        </span>
        <button
          type="button"
          onClick={onToggleSound}
          className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl border border-white/10 bg-[#121219] text-zinc-300 hover:text-white hover:border-white/20 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
          aria-label={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
        >
          {soundEnabled ? (
            <Volume2 className="w-5 h-5 text-violet-400" />
          ) : (
            <VolumeX className="w-5 h-5 text-zinc-500" />
          )}
        </button>
      </header>

      {/* Main Title Stage */}
      <main className="my-auto py-6 sm:py-8 grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left / Primary Column */}
        <div className="md:col-span-7 flex flex-col items-center md:items-start text-center md:text-left">
          <ZeloraLogo size="lg" showWordmark={false} />

          <h1 className="mt-5 font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-[0.06em] text-white leading-[1.04] text-balance">
            ZELORA <span className="text-violet-400">IMPOSTER</span>
          </h1>

          <p className="mt-3 max-w-md text-base sm:text-lg text-zinc-300 font-medium leading-relaxed text-balance">
            Think Carefully. Speak Wisely. Find the Imposter.
          </p>

          {/* Menu Actions */}
          <div className="mt-8 w-full max-w-sm space-y-3">
            {hasActiveSession && (
              <button
                type="button"
                onClick={onResumeGame}
                className="w-full min-h-[52px] px-5 rounded-xl border border-amber-400/40 bg-amber-500/10 text-amber-200 hover:bg-amber-500/18 active:translate-y-[1px] transition-all font-display text-sm sm:text-base font-bold tracking-wider flex items-center justify-center gap-2.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                <RotateCcw className="w-4 h-4 shrink-0 text-amber-400" />
                <span>
                  RESUME ROUND {activeRound} ({activePlayerCount} PLAYERS)
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={onPlayGame}
              className="w-full min-h-[58px] px-6 rounded-xl bg-violet-600 hover:bg-violet-500 border-b-[3px] border-violet-800 active:border-b-0 active:translate-y-[2px] transition-all text-white font-display text-lg font-extrabold tracking-[0.08em] flex items-center justify-center gap-3 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
            >
              <Play className="w-5 h-5 fill-current shrink-0" />
              <span>PLAY GAME</span>
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <button
                type="button"
                onClick={onHowToPlay}
                className="min-h-[48px] px-3.5 rounded-xl border border-white/10 bg-[#12121A] hover:bg-[#191924] hover:border-white/20 active:translate-y-[1px] transition-all text-zinc-200 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
              >
                <BookOpen className="w-4 h-4 text-violet-400 shrink-0" />
                <span>HOW TO PLAY</span>
              </button>

              <button
                type="button"
                onClick={onSettings}
                className="min-h-[48px] px-3.5 rounded-xl border border-white/10 bg-[#12121A] hover:bg-[#191924] hover:border-white/20 active:translate-y-[1px] transition-all text-zinc-200 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
              >
                <Settings className="w-4 h-4 text-violet-400 shrink-0" />
                <span>SETTINGS</span>
              </button>

              <button
                type="button"
                onClick={onAbout}
                className="min-h-[48px] px-3.5 rounded-xl border border-white/10 bg-[#12121A] hover:bg-[#191924] hover:border-white/20 active:translate-y-[1px] transition-all text-zinc-200 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
              >
                <Info className="w-4 h-4 text-violet-400 shrink-0" />
                <span>ABOUT</span>
              </button>
            </div>

            <div className="pt-1">
              <PWAInstallButton />
            </div>
          </div>
        </div>

        {/* Right Column: Tactile Card Deck Preview (Tablet & Laptop/Desktop) */}
        <div
          aria-hidden="true"
          className="hidden md:flex md:col-span-5 items-center justify-center"
        >
          <div className="relative w-60 h-80 lg:w-72 lg:h-96 select-none">
            {/* Back card 1 */}
            <div className="absolute inset-0 rounded-2xl border border-white/10 bg-[#14141E] -rotate-6 -translate-x-5 translate-y-2 p-5 flex flex-col justify-between">
              <span className="font-mono text-xs text-zinc-500">01</span>
              <div className="self-center w-12 h-12 rounded-full border border-white/10 flex items-center justify-center">
                <div className="w-3 h-3 rotate-45 bg-violet-500/40" />
              </div>
              <span className="font-mono text-xs text-zinc-500 self-end">01</span>
            </div>

            {/* Back card 2 (Imposter edge hint) */}
            <div className="absolute inset-0 rounded-2xl border border-red-500/35 bg-[#191015] rotate-6 translate-x-6 translate-y-3 p-5 flex flex-col justify-between">
              <span className="font-mono text-xs text-red-400/80">03</span>
              <div className="text-center">
                <div className="font-display text-xl font-extrabold tracking-widest text-red-500">
                  IMPOSTER
                </div>
                <div className="mt-1 text-xs font-mono text-zinc-400 tracking-wider">
                  CATEGORY HINT
                </div>
              </div>
              <span className="font-mono text-xs text-red-400/80 self-end">03</span>
            </div>

            {/* Front Hero Card */}
            <div className="absolute inset-0 rounded-2xl border border-violet-500/40 bg-[#12111D] p-6 flex flex-col justify-between shadow-2xl">
              <div className="flex items-center justify-between font-mono text-xs text-violet-300">
                <span>PLAYER 02</span>
                <span>SECRET</span>
              </div>
              <div className="text-center space-y-2">
                <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-400">
                  ONE PHONE · ONE IMPOSTER
                </div>
                <div className="font-display text-2xl lg:text-3xl font-extrabold tracking-wider text-white">
                  DEDUCE
                </div>
                <div className="mx-auto w-10 h-0.5 bg-amber-400/80" />
              </div>
              <div className="flex items-center justify-between font-mono text-xs text-zinc-500">
                <span>572 WORDS</span>
                <span>OFFLINE</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Developer Credits */}
      <footer className="pt-4 text-center md:text-left text-xs text-zinc-500">
        <span>Developed by Zelora</span>
        <span aria-hidden="true" className="mx-2">
          ·
        </span>
        <span>v1.0.0</span>
      </footer>
    </div>
  );
};
