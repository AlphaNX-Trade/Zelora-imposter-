import React from 'react';
import { Award, Home, Play } from 'lucide-react';
import type { LeaderboardEntry, RoundOutcome } from '../types/game';
import { formatPlayerNumber } from '../utils/gameEngine';
import { ParticleCanvas } from './ParticleCanvas';

interface ResultScreenProps {
  outcome: RoundOutcome;
  leaderboard: LeaderboardEntry[];
  onPlayNextRound: () => void;
  onReturnHome: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  outcome,
  leaderboard,
  onPlayNextRound,
  onReturnHome,
}) => {
  const isVictory = outcome.winningSide === 'PLAYERS';
  const imposterLabel = formatPlayerNumber(outcome.imposterPlayer);
  const votedOutLabel = formatPlayerNumber(outcome.votedOutPlayer);

  return (
    <div
      className={`min-h-[100dvh] flex flex-col px-5 py-6 sm:px-8 max-w-4xl mx-auto w-full relative ${
        !isVictory ? 'animate-subtle-shake' : ''
      }`}
    >
      <ParticleCanvas mode={isVictory ? 'victory' : 'defeat'} />

      <header className="relative z-10 flex items-center justify-between text-xs text-zinc-400">
        <span className="font-semibold uppercase tracking-[0.18em] text-violet-400">
          ROUND COMPLETED
        </span>
        <span className="font-mono tabular-nums">
          Round {String(outcome.roundNumber).padStart(2, '0')}
        </span>
      </header>

      <main className="relative z-10 flex-1 py-5 space-y-6">
        {isVictory ? (
          <section className="animate-reveal-pop rounded-2xl border border-amber-400/45 bg-gradient-to-b from-[#1D180F] to-[#121219] p-7 sm:p-10 text-center shadow-2xl relative overflow-hidden">
            <div
              aria-hidden="true"
              className="absolute top-0 left-0 right-0 h-1.5 bg-amber-400"
            />
            <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-wider text-amber-300 text-balance">
              IMPOSTER FOUND!
            </h1>
            <p className="mt-2 text-sm sm:text-base font-bold tracking-[0.2em] uppercase text-white">
              YOU CAUGHT THE IMPOSTER!
            </p>

            <div className="mt-6 rounded-xl border border-amber-400/25 bg-black/35 px-5 py-5">
              <div className="font-mono text-xl sm:text-2xl font-extrabold tracking-widest text-white tabular-nums">
                {imposterLabel} WAS THE IMPOSTER!
              </div>
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
                  THE SECRET WORD WAS:
                </div>
                <div className="mt-1 font-display text-3xl sm:text-4xl font-extrabold tracking-wider text-amber-300">
                  {outcome.secretWord}
                </div>
              </div>
            </div>

            <p className="mt-4 text-xs sm:text-sm text-amber-200/85">
              Innocents +1 point · {imposterLabel} 0 points
            </p>
          </section>
        ) : (
          <section className="animate-reveal-pop rounded-2xl border border-red-500/50 bg-gradient-to-b from-[#1F0E12] to-[#121015] p-7 sm:p-10 text-center shadow-2xl relative overflow-hidden">
            <div
              aria-hidden="true"
              className="absolute top-0 left-0 right-0 h-1.5 bg-red-600"
            />
            <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-wider text-red-500 text-balance">
              WRONG VOTE!
            </h1>
            <p className="mt-2 text-sm sm:text-base font-bold tracking-[0.2em] uppercase text-white">
              THE IMPOSTER ESCAPED!
            </p>

            <div className="mt-6 rounded-xl border border-red-500/25 bg-black/40 px-5 py-5">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
                THE IMPOSTER WAS:
              </div>
              <div className="mt-1 font-mono text-2xl sm:text-3xl font-extrabold tracking-widest text-red-400 tabular-nums">
                {imposterLabel}
              </div>
              <div className="mt-1.5 text-xs text-zinc-400">
                Most votes went to {votedOutLabel}.
              </div>

              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
                  THE SECRET WORD WAS:
                </div>
                <div className="mt-1 font-display text-3xl sm:text-4xl font-extrabold tracking-wider text-white">
                  {outcome.secretWord}
                </div>
              </div>
            </div>

            <p className="mt-4 text-xs sm:text-sm text-red-200/85">
              {imposterLabel} +1 point · Other players 0 points
            </p>
          </section>
        )}

        {/* Round Breakdown & Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <section className="lg:col-span-5 rounded-2xl border border-white/10 bg-[#12121A] p-6">
            <h2 className="font-display text-lg font-bold text-white">
              ROUND SUMMARY
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-white/8">
                <dt className="text-zinc-400">Round</dt>
                <dd className="font-mono font-bold text-white tabular-nums">
                  {String(outcome.roundNumber).padStart(2, '0')}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-white/8">
                <dt className="text-zinc-400">Winning Side</dt>
                <dd
                  className={`font-semibold ${
                    isVictory ? 'text-amber-300' : 'text-red-400'
                  }`}
                >
                  {isVictory ? 'Innocent Players' : 'Imposter'}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-white/8">
                <dt className="text-zinc-400">Imposter</dt>
                <dd className="font-mono font-bold text-red-400 tabular-nums">
                  {imposterLabel}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-white/8">
                <dt className="text-zinc-400">Secret Word</dt>
                <dd className="font-display font-bold text-white">
                  {outcome.secretWord}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-white/8">
                <dt className="text-zinc-400">Imposter Hint</dt>
                <dd className="font-medium text-zinc-200">{outcome.hintShown}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-zinc-400">Top Suspect</dt>
                <dd className="font-mono font-semibold text-zinc-200 tabular-nums">
                  {votedOutLabel} (
                  {outcome.voteCounts[outcome.votedOutPlayer] ?? 0} votes)
                </dd>
              </div>
            </dl>
          </section>

          <section className="lg:col-span-7 rounded-2xl border border-white/10 bg-[#12121A] p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-white">
                LEADERBOARD
              </h2>
              <Award className="w-5 h-5 text-amber-400" />
            </div>

            <div className="mt-4 divide-y divide-white/8 max-h-[340px] overflow-y-auto pr-1">
              {leaderboard.map((entry, idx) => {
                const isTop = idx === 0 && entry.score > 0;
                const isImposter = entry.playerNumber === outcome.imposterPlayer;
                return (
                  <div
                    key={entry.playerNumber}
                    className="py-3 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-6 font-mono text-xs font-bold tabular-nums ${
                          isTop ? 'text-amber-400' : 'text-zinc-500'
                        }`}
                      >
                        #{entry.rank}
                      </span>
                      <span className="font-mono text-sm sm:text-base font-bold text-white tabular-nums">
                        {formatPlayerNumber(entry.playerNumber)}
                      </span>
                      {isImposter && (
                        <span className="text-xs font-semibold text-red-400">
                          · Imposter
                        </span>
                      )}
                    </div>

                    <span
                      className={`font-mono text-sm font-bold tabular-nums ${
                        isTop ? 'text-amber-300' : 'text-zinc-300'
                      }`}
                    >
                      {entry.score} {entry.score === 1 ? 'POINT' : 'POINTS'}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </main>

      <footer className="relative z-10 pt-2 pb-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onPlayNextRound}
          className="w-full min-h-[56px] px-6 rounded-xl bg-violet-600 hover:bg-violet-500 border-b-[3px] border-violet-800 active:border-b-0 active:translate-y-[2px] transition-all text-white font-display text-base sm:text-lg font-extrabold tracking-wider flex items-center justify-center gap-2.5 cursor-pointer"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>PLAY NEXT ROUND</span>
        </button>

        <button
          type="button"
          onClick={onReturnHome}
          className="w-full min-h-[56px] px-6 rounded-xl border border-white/12 bg-[#13131C] hover:bg-[#1B1B27] active:translate-y-[1px] transition-all text-zinc-200 font-display text-base font-bold tracking-wider flex items-center justify-center gap-2.5 cursor-pointer"
        >
          <Home className="w-5 h-5 text-zinc-400" />
          <span>RETURN TO HOME</span>
        </button>
      </footer>
    </div>
  );
};
