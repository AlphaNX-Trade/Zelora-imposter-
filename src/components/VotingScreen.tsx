import React, { useEffect, useState } from 'react';
import { Check, Lock, Vote } from 'lucide-react';
import type { GameSession } from '../types/game';
import { formatPlayerNumber } from '../utils/gameEngine';

interface VotingScreenProps {
  session: GameSession;
  onConfirmVote: (targetPlayer: number) => void;
  onStartNextVoter: () => void;
}

export const VotingScreen: React.FC<VotingScreenProps> = ({
  session,
  onConfirmVote,
  onStartNextVoter,
}) => {
  const [selectedTarget, setSelectedTarget] = useState<number | null>(null);

  const currentVoter = session.voterIndex + 1;
  const voterLabel = formatPlayerNumber(currentVoter);
  const progressPct = (currentVoter / session.playerCount) * 100;

  useEffect(() => {
    setSelectedTarget(null);
  }, [session.voterIndex, session.votingHandoff, session.revoteRound]);

  if (session.votingHandoff) {
    return (
      <div className="min-h-[100dvh] flex flex-col justify-between px-5 py-6 sm:px-8 max-w-xl mx-auto w-full">
        <header className="space-y-2.5">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-semibold uppercase tracking-[0.18em] text-violet-400">
              {session.revoteRound > 0
                ? `Tie-Breaker Revote ${session.revoteRound}`
                : 'Private Ballot'}
            </span>
            <span className="font-mono tabular-nums">
              {currentVoter} of {session.playerCount}
            </span>
          </div>
          <div className="h-1 w-full rounded-full bg-white/8 overflow-hidden">
            <div
              className="h-full bg-violet-500 transition-transform duration-300 origin-left"
              style={{ transform: `scaleX(${progressPct / 100})` }}
            />
          </div>
        </header>

        <main className="my-auto py-6">
          <div className="animate-reveal-pop rounded-2xl border border-white/12 bg-[#12121A] p-7 sm:p-9 text-center shadow-2xl">
            <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-zinc-400">
              <Lock className="w-3.5 h-3.5 text-violet-400" />
              <span>Vote Saved</span>
            </div>

            <div className="mt-5 font-mono text-3xl sm:text-4xl font-bold tracking-[0.12em] text-white tabular-nums">
              {voterLabel}
            </div>

            <p className="mt-4 text-sm sm:text-base text-zinc-300 max-w-xs mx-auto leading-relaxed">
              Pass the phone to {voterLabel}. Keep your choice hidden from others.
            </p>

            <button
              type="button"
              onClick={onStartNextVoter}
              className="mt-8 w-full min-h-[58px] px-6 rounded-xl bg-violet-600 hover:bg-violet-500 border-b-[3px] border-violet-800 active:border-b-0 active:translate-y-[2px] transition-all text-white font-display text-base sm:text-lg font-extrabold tracking-wider cursor-pointer"
            >
              TAP TO VOTE ({voterLabel})
            </button>
          </div>
        </main>

        <footer className="pb-2 text-center text-xs text-zinc-500">
          Previous votes are cleared from view.
        </footer>
      </div>
    );
  }

  const selectablePlayers = session.candidatePool;
  const alreadyVoted = session.votes[currentVoter] !== undefined;

  const handleConfirm = () => {
    if (alreadyVoted) return;
    if (selectedTarget === null || selectedTarget === currentVoter) return;
    const chosen = selectedTarget;
    setSelectedTarget(null);
    onConfirmVote(chosen);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col justify-between px-5 py-6 sm:px-8 max-w-3xl mx-auto w-full">
      <header className="space-y-2.5">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span className="font-semibold uppercase tracking-[0.18em] text-violet-400">
            Voter: {voterLabel}
          </span>
          <span className="font-mono tabular-nums">
            {currentVoter} of {session.playerCount}
          </span>
        </div>
        <div className="h-1 w-full rounded-full bg-white/8 overflow-hidden">
          <div
            className="h-full bg-violet-500 transition-transform duration-300 origin-left"
            style={{ transform: `scaleX(${progressPct / 100})` }}
          />
        </div>
      </header>

      <main className="my-auto py-6">
        <div className="text-center mb-6">
          {session.revoteRound > 0 && (
            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
              Revote · Tied Candidates Only
            </div>
          )}
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-wide text-white">
            WHO IS THE IMPOSTER?
          </h2>
          <p className="mt-2 text-sm sm:text-base text-zinc-400">
            Select the player you think is the imposter.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {selectablePlayers.map((playerNum) => {
            const isSelf = playerNum === currentVoter;
            const isSelected = selectedTarget === playerNum;

            return (
              <button
                key={playerNum}
                type="button"
                disabled={isSelf}
                onClick={() => {
                  if (!isSelf) setSelectedTarget(playerNum);
                }}
                aria-pressed={isSelected}
                className={`min-h-[68px] p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                  isSelf
                    ? 'border-white/5 bg-[#0D0D13] text-zinc-600 cursor-not-allowed opacity-55'
                    : isSelected
                      ? 'border-violet-400 bg-violet-600/22 text-white cursor-pointer'
                      : 'border-white/10 bg-[#13131C] text-zinc-100 hover:border-violet-500/45 hover:bg-[#191926] active:scale-[0.98] cursor-pointer'
                }`}
              >
                <span className="font-mono text-sm sm:text-base font-bold tracking-wider tabular-nums">
                  {formatPlayerNumber(playerNum)}
                </span>
                {isSelf ? (
                  <span className="text-[11px] text-zinc-500">You</span>
                ) : isSelected ? (
                  <span className="text-[11px] font-semibold text-violet-300 inline-flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    Selected
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </main>

      <footer className="pb-2">
        <button
          type="button"
          onClick={handleConfirm}
          disabled={selectedTarget === null || alreadyVoted}
          className="w-full min-h-[58px] px-6 rounded-xl bg-violet-600 hover:bg-violet-500 border-b-[3px] border-violet-800 disabled:border-b-0 disabled:bg-white/8 disabled:text-zinc-500 active:border-b-0 active:translate-y-[2px] transition-all text-white font-display text-base sm:text-lg font-extrabold tracking-wider flex items-center justify-center gap-2.5 cursor-pointer disabled:cursor-not-allowed"
        >
          <Vote className="w-5 h-5" />
          <span>
            {selectedTarget !== null
              ? `CONFIRM VOTE · ${formatPlayerNumber(selectedTarget)}`
              : 'SELECT A PLAYER'}
          </span>
        </button>
      </footer>
    </div>
  );
};
