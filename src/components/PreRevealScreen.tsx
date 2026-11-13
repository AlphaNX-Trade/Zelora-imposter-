import React from 'react';
import { Lock } from 'lucide-react';

interface PreRevealScreenProps {
  roundNumber: number;
  playerCount: number;
  onRevealResult: () => void;
}

export const PreRevealScreen: React.FC<PreRevealScreenProps> = ({
  roundNumber,
  playerCount,
  onRevealResult,
}) => {
  return (
    <div className="min-h-[100dvh] flex flex-col justify-between px-5 py-6 sm:px-8 max-w-xl mx-auto w-full">
      <header className="flex items-center justify-between text-xs text-zinc-400">
        <span className="font-semibold uppercase tracking-[0.18em] text-violet-400">
          Round {String(roundNumber).padStart(2, '0')}
        </span>
        <span className="font-mono tabular-nums">
          {playerCount} / {playerCount} Votes Locked
        </span>
      </header>

      <main className="my-auto py-8">
        <div className="animate-reveal-pop rounded-2xl border border-violet-500/35 bg-[#12121B] p-8 sm:p-10 text-center shadow-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-amber-300">
            <Lock className="w-3.5 h-3.5" />
            <span>Ballot Sealed</span>
          </div>

          <h2 className="mt-4 font-display text-3xl sm:text-4xl font-extrabold tracking-wide text-white text-balance">
            ALL VOTES COMPLETED!
          </h2>
          <p className="mt-3 text-base sm:text-lg text-zinc-300">
            Ready to discover the imposter?
          </p>

          <button
            type="button"
            onClick={onRevealResult}
            className="mt-9 w-full min-h-[62px] px-6 rounded-xl bg-amber-400 hover:bg-amber-300 border-b-[3px] border-amber-600 active:border-b-0 active:translate-y-[2px] transition-all text-[#09090D] font-display text-lg sm:text-xl font-extrabold tracking-wider cursor-pointer"
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
