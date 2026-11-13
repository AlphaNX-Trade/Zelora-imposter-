import React, { useState } from 'react';
import { ArrowLeft, Award, Clock, ShieldAlert, Trash2 } from 'lucide-react';
import type { GameHistoryRecord } from '../types/game';

interface HistoryScreenProps {
  history: GameHistoryRecord[];
  onClearHistory: () => void;
  onBack: () => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  history,
  onClearHistory,
  onBack,
}) => {
  const [confirmClear, setConfirmClear] = useState(false);

  const playerWins = history.filter((h) => h.winningSide === 'PLAYERS').length;
  const imposterWins = history.length - playerWins;

  return (
    <div className="safe-screen flex flex-col max-w-3xl mx-auto w-full">
      <header className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] px-3 -ml-2 inline-flex items-center gap-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">
          Game History
        </span>
        <div className="w-16" aria-hidden="true" />
      </header>

      <main className="flex-1 py-6 space-y-5">
        <div className="grid grid-cols-3 gap-3">
          <div className="gaming-card rounded-xl p-4 text-center">
            <div className="font-mono text-2xl font-bold text-white tabular-nums">
              {history.length}
            </div>
            <div className="text-[11px] uppercase tracking-wider text-zinc-400 mt-1">
              Rounds
            </div>
          </div>
          <div className="gaming-card rounded-xl p-4 text-center border-amber-400/25">
            <div className="font-mono text-2xl font-bold text-amber-300 tabular-nums">
              {playerWins}
            </div>
            <div className="text-[11px] uppercase tracking-wider text-zinc-400 mt-1">
              Crew Wins
            </div>
          </div>
          <div className="gaming-card rounded-xl p-4 text-center border-red-500/25">
            <div className="font-mono text-2xl font-bold text-red-400 tabular-nums">
              {imposterWins}
            </div>
            <div className="text-[11px] uppercase tracking-wider text-zinc-400 mt-1">
              Imposter Wins
            </div>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="gaming-card rounded-2xl p-8 sm:p-10 text-center space-y-3">
            <Clock className="w-8 h-8 text-sky-400/70 mx-auto" />
            <h2 className="font-display text-xl font-bold text-white">
              No Completed Rounds Yet
            </h2>
            <p className="text-sm text-zinc-400 max-w-sm mx-auto leading-relaxed">
              Finish a round to save the secret word, imposter identity, hint clue,
              and winner locally on your device.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => {
              const isWin = item.winningSide === 'PLAYERS';
              const dateLabel = new Date(item.playedAt).toLocaleDateString(
                undefined,
                {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                },
              );

              return (
                <article
                  key={item.id}
                  className={`gaming-card rounded-2xl p-4 sm:p-5 border-l-4 ${
                    isWin ? 'border-l-amber-400' : 'border-l-red-500'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                        <span>ROUND {String(item.roundNumber).padStart(2, '0')}</span>
                        <span aria-hidden="true">·</span>
                        <span>{item.playerCount} PLAYERS</span>
                        <span aria-hidden="true">·</span>
                        <span>{item.hintDifficulty.toUpperCase()}</span>
                      </div>
                      <h3 className="mt-1 font-display text-xl font-extrabold text-white">
                        {item.secretWord}
                      </h3>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider shrink-0 ${
                        isWin
                          ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30'
                          : 'bg-red-500/15 text-red-300 border border-red-500/30'
                      }`}
                    >
                      {isWin ? (
                        <Award className="w-3.5 h-3.5" />
                      ) : (
                        <ShieldAlert className="w-3.5 h-3.5" />
                      )}
                      <span>{isWin ? 'Crew Won' : 'Imposter Escaped'}</span>
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 pt-3 border-t border-white/8 text-xs">
                    <div>
                      <span className="text-zinc-500">Imposter: </span>
                      <span className="font-mono font-bold text-red-300">
                        {item.imposterLabel}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Group Vote: </span>
                      <span className="font-mono font-semibold text-zinc-200">
                        {item.votedOutLabel}
                      </span>
                    </div>
                    <div className="sm:text-right text-zinc-500">{dateLabel}</div>
                  </div>

                  <div className="mt-2 text-xs text-zinc-400">
                    <span className="text-zinc-500">Hint ({item.category}): </span>
                    <span className="text-sky-200">{item.hintShown}</span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {history.length > 0 && (
        <footer className="pb-2 pt-2">
          {!confirmClear ? (
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="w-full min-h-[48px] px-4 rounded-xl border border-red-500/25 bg-red-500/8 hover:bg-red-500/15 text-sm font-semibold text-red-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear Match History</span>
            </button>
          ) : (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 space-y-2.5">
              <div className="text-xs text-red-200 text-center">
                Delete all saved round history and played word tracking?
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="min-h-[44px] rounded-lg bg-[#1A1A24] text-xs font-semibold text-zinc-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClearHistory();
                    setConfirmClear(false);
                  }}
                  className="min-h-[44px] rounded-lg bg-red-600 text-xs font-bold text-white cursor-pointer"
                >
                  Confirm Clear
                </button>
              </div>
            </div>
          )}
        </footer>
      )}
    </div>
  );
};
