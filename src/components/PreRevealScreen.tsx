import React from 'react';
import { Lock } from 'lucide-react';
import { formatPlayerNumber } from '../utils/gameEngine';
import { ExitGameButton } from './ExitGameControl';

interface PreRevealScreenProps {
  roundNumber: number;
  selectedSuspect: number;
  onRevealResult: () => void;
  onRequestExit: () => void;
}

export const PreRevealScreen: React.FC<PreRevealScreenProps> = ({
  roundNumber,
  selectedSuspect,
  onRevealResult,
  onRequestExit,
}) => {
  return (
    <div className="safe-screen flex flex-col justify-between max-w-xl mx-auto w-full">
      <header className="flex items-center justify-between gap-3 text-xs text-zinc-400">
        <div className="flex items-center gap-3">
          <span className="font-semibold uppercase tracking-[0.18em] text-violet-400">
            Round {String(roundNumber).padStart(2, '0')}
          </span>
          <span className="font-mono uppercase tracking-wider text-amber-300">
            Vote Locked
          </span>
        </div>
        <ExitGameButton onClick={onRequestExit} />
      </header>

      <main className="my-auto py-8">
        <div className="animate-reveal-pop rounded-2xl border border-violet-500/35 bg-[#12121B] p-8 sm:p-10 text-center shadow-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-amber-300">
            <Lock className="w-3.5 h-3.5" />
            <span>Group Decision Confirmed</span>
          </div>

          <h2 className="mt-4 font-display text-3xl sm:text-4xl font-extrabold tracking-wide text-white text-balance">
            GROUP VOTE LOCKED!
          </h2>

          <div className="mt-4 inline-block rounded-xl border border-white/10 bg-black/30 px-4 py-2 font-mono text-sm font-bold tracking-wider text-violet-200 tabular-nums">
            Suspect: {formatPlayerNumber(selectedSuspect)}
          </div>

          <p className="mt-4 text-base sm:text-lg text-zinc-300">
            Ready to discover the imposter?
          </p>

          <button
            type="button"
            onClick={onRevealResult}
            className="mt-8 w-full min-h-[62px] px-6 rounded-xl bg-amber-400 hover:bg-amber-300 border-b-[3px] border-amber-600 active:border-b-0 active:translate-y-[2px] transition-all text-[#09090D] font-display text-lg sm:text-xl font-extrabold tracking-wider cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
          >
            REVEAL RESULT
          </button>
        </div>
      </main>

      <footer className="pb-2 text-center text-xs text-zinc-500">
        Set the phone down where everyone can see before tapping.
      </footer>
    </div>
  );
};
