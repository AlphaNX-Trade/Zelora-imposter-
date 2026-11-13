import React, { useEffect, useState } from 'react';
import { ArrowLeft, Check, Users, Vote } from 'lucide-react';
import type { GameSession } from '../types/game';
import { getPlayerDisplayName } from '../utils/gameEngine';
import { ExitGameButton } from './ExitGameControl';

interface VotingScreenProps {
  session: GameSession;
  onConfirmVote: (targetPlayer: number) => void;
  onBackToDiscussion: () => void;
  onRequestExit: () => void;
}

export const VotingScreen: React.FC<VotingScreenProps> = ({
  session,
  onConfirmVote,
  onBackToDiscussion,
  onRequestExit,
}) => {
  const [selectedTarget, setSelectedTarget] = useState<number | null>(null);

  useEffect(() => {
    setSelectedTarget(null);
  }, [session.roundNumber]);

  const players = Array.from({ length: session.playerCount }, (_, i) => i + 1);
  const selectedLabel =
    selectedTarget !== null
      ? getPlayerDisplayName(selectedTarget, session.playerNames)
      : null;

  const handleConfirm = () => {
    if (session.voteLocked || session.selectedSuspect !== null) return;
    if (selectedTarget === null) return;
    onConfirmVote(selectedTarget);
  };

  return (
    <div className="safe-screen flex flex-col justify-between max-w-3xl mx-auto w-full">
      <header className="flex items-center justify-between gap-4 text-xs text-zinc-400">
        {!session.voteLocked ? (
          <button
            type="button"
            onClick={onBackToDiscussion}
            className="min-h-[44px] px-3 -ml-2 inline-flex items-center gap-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Discuss More</span>
          </button>
        ) : (
          <span className="font-semibold uppercase tracking-[0.18em] text-sky-400">
            Round {String(session.roundNumber).padStart(2, '0')}
          </span>
        )}

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 font-semibold uppercase tracking-[0.18em] text-sky-400">
            <Users className="w-3.5 h-3.5" />
            <span>
              Group Vote · Round {String(session.roundNumber).padStart(2, '0')}
            </span>
          </span>
          <ExitGameButton onClick={onRequestExit} />
        </div>
      </header>

      <main className="my-auto py-6">
        <div className="text-center mb-6">
          <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-sky-400 mb-2">
            ONE COLLECTIVE GROUP VOTE
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-wide text-white">
            WHO IS THE IMPOSTER?
          </h2>
          <p className="mt-2 text-sm sm:text-base text-zinc-300 max-w-md mx-auto leading-relaxed">
            Discuss together and select ONE suspect for the entire group. Once
            confirmed, the vote is locked.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {players.map((playerNum) => {
            const isSelected = selectedTarget === playerNum;
            const displayName = getPlayerDisplayName(
              playerNum,
              session.playerNames,
            );

            return (
              <button
                key={playerNum}
                type="button"
                disabled={session.voteLocked}
                onClick={() => {
                  if (!session.voteLocked) setSelectedTarget(playerNum);
                }}
                aria-pressed={isSelected}
                className={`min-h-[72px] p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                  session.voteLocked
                    ? 'border-white/5 bg-[#0D0D13] text-zinc-600 cursor-not-allowed opacity-60'
                    : isSelected
                      ? 'border-sky-400 bg-gradient-to-br from-violet-600/30 to-sky-500/20 text-white shadow-[0_0_22px_-6px_rgba(56,189,248,0.65)] cursor-pointer'
                      : 'gaming-card text-zinc-100 hover:border-sky-400/45 active:scale-[0.98] cursor-pointer'
                }`}
              >
                <span className="font-mono text-sm sm:text-base font-bold tracking-wider tabular-nums truncate max-w-full">
                  {displayName}
                </span>
                {isSelected && (
                  <span className="text-[11px] font-semibold text-sky-300 inline-flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    Selected
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </main>

      <footer className="pb-2 space-y-2.5">
        <button
          type="button"
          onClick={handleConfirm}
          disabled={selectedTarget === null || session.voteLocked}
          className="w-full min-h-[58px] px-6 rounded-xl gaming-btn-primary disabled:bg-none disabled:border-b-0 disabled:bg-white/8 disabled:text-zinc-500 disabled:shadow-none active:border-b-0 active:translate-y-[2px] transition-all text-white font-display text-base sm:text-lg font-extrabold tracking-wider flex items-center justify-center gap-2.5 cursor-pointer disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
        >
          <Vote className="w-5 h-5" />
          <span>
            {selectedLabel !== null
              ? `CONFIRM VOTE · ${selectedLabel}`
              : 'SELECT ONE PLAYER'}
          </span>
        </button>

        <p className="text-center text-xs text-zinc-500">
          Can&apos;t agree yet? Keep discussing until the group chooses one
          player.
        </p>
      </footer>
    </div>
  );
};
