import React from 'react';
import { RefreshCw } from 'lucide-react';
import { formatPlayerNumber } from '../utils/gameEngine';

interface TieScreenProps {
  roundNumber: number;
  tiedPlayers: number[];
  voteCounts: Record<number, number>;
  revoteRound: number;
  onStartRevote: () => void;
}

export const TieScreen: React.FC<TieScreenProps> = ({
  roundNumber,
  tiedPlayers,
  voteCounts,
  revoteRound,
  onStartRevote,
}) => {
  const tiedVoteNum = voteCounts[tiedPlayers[0]] ?? 0;

  return (
    <div className="min-h-[100dvh] flex flex-col justify-between px-5 py-6 sm:px-8 max-w-xl mx-auto w-full">
      <header className="flex items-center justify-between text-xs text-zinc-400">
        <span className="font-semibold uppercase tracking-[0.18em] text-amber-400">
          Round {String(roundNumber).padStart(2, '0')} · Tie-Breaker
        </span>
        <span className="font-mono tabular-nums">
          {revoteRound > 0 ? `Revote #${revoteRound}` : 'Split Vote'}
        </span>
      </header>

      <main className="my-auto py-6">
        <div className="animate-reveal-pop rounded-2xl border border-amber-400/40 bg-[#15120F] p-7 sm:p-9 text-center shadow-2xl">
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-amber-400">
            No Majority
          </div>

          <h2 className="mt-3 font-display text-2xl sm:text-3xl font-extrabold tracking-wide text-white">
            TIE VOTE!
          </h2>
          <p className="mt-2 text-sm sm:text-base text-zinc-300">
            {tiedPlayers.length} players tied with{' '}
            <span className="font-mono font-bold text-amber-300 tabular-nums">
              {tiedVoteNum}
            </span>{' '}
            {tiedVoteNum === 1 ? 'vote' : 'votes'} each. Vote again between the
            tied players.
          </p>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {tiedPlayers.map((playerNum) => (
              <div
                key={playerNum}
                className="rounded-xl border border-amber-400/35 bg-[#1F1A14] px-3 py-3.5 font-mono text-sm font-bold text-amber-200 tabular-nums"
              >
                {formatPlayerNumber(playerNum)}
              </div>
            ))}
          </div>

          <p className="mt-5 text-xs text-zinc-400">
            Imposter identity stays hidden until the tie is broken.
          </p>
        </div>
      </main>

      <footer className="pb-2">
        <button
          type="button"
          onClick={onStartRevote}
          className="w-full min-h-[58px] px-6 rounded-xl bg-amber-400 hover:bg-amber-300 border-b-[3px] border-amber-600 active:border-b-0 active:translate-y-[2px] transition-all text-[#09090D] font-display text-lg font-extrabold tracking-wider flex items-center justify-center gap-2.5 cursor-pointer"
        >
          <RefreshCw className="w-5 h-5" />
          <span>START REVOTE</span>
        </button>
      </footer>
    </div>
  );
};
