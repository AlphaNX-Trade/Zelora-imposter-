import React from 'react';
import { Check, Eye } from 'lucide-react';
import type { GameSession, HintDifficulty } from '../types/game';
import { formatPlayerNumber, getHintForDifficulty } from '../utils/gameEngine';
import { ExitGameButton } from './ExitGameControl';

interface RevealScreenProps {
  session: GameSession;
  hintDifficulty: HintDifficulty;
  onTapReveal: () => void;
  onTapDone: () => void;
  onRequestExit: () => void;
}

export const RevealScreen: React.FC<RevealScreenProps> = ({
  session,
  hintDifficulty,
  onTapReveal,
  onTapDone,
  onRequestExit,
}) => {
  const currentPlayerNumber = session.revealIndex + 1;
  const playerLabel = formatPlayerNumber(currentPlayerNumber);
  const shortNum = String(currentPlayerNumber).padStart(2, '0');
  const isImposter = currentPlayerNumber === session.imposterPlayer;
  const progressPct = ((session.revealIndex + 1) / session.playerCount) * 100;

  return (
    <div className="safe-screen flex flex-col justify-between max-w-xl mx-auto w-full">
      {/* Round & Seat Progress */}
      <header className="space-y-2.5">
        <div className="flex items-center justify-between gap-3 text-xs text-zinc-400">
          <div className="flex items-center gap-3">
            <span className="font-semibold tracking-[0.18em] uppercase text-violet-400">
              Round {String(session.roundNumber).padStart(2, '0')}
            </span>
            <span className="font-mono tabular-nums text-zinc-500">
              {currentPlayerNumber} of {session.playerCount}
            </span>
          </div>
          <ExitGameButton onClick={onRequestExit} />
        </div>
        <div className="h-1 w-full rounded-full bg-white/8 overflow-hidden">
          <div
            className="h-full bg-violet-500 transition-transform duration-300 origin-left"
            style={{ transform: `scaleX(${progressPct / 100})` }}
          />
        </div>
      </header>

      {/* Physical Role Card */}
      <main className="my-auto py-6">
        {session.revealStep === 'PROMPT' ? (
          <div className="animate-reveal-pop rounded-2xl border border-white/12 bg-[#12121A] p-6 sm:p-8 flex flex-col justify-between min-h-[380px] shadow-2xl relative overflow-hidden">
            {/* Card top index */}
            <div className="flex items-center justify-between font-mono text-xs text-zinc-500">
              <span>SEAT {shortNum}</span>
              <span>PRIVATE</span>
            </div>

            <div className="my-auto py-6 text-center">
              <div className="font-mono text-3xl sm:text-4xl font-bold tracking-[0.12em] text-white tabular-nums">
                {playerLabel}
              </div>
              <div className="mt-2 text-xs font-bold uppercase tracking-[0.26em] text-violet-400">
                YOUR TURN
              </div>

              <p className="mt-6 text-sm sm:text-base text-zinc-300 max-w-xs mx-auto leading-relaxed">
                Make sure nobody else is looking at the screen.
              </p>

              <button
                type="button"
                onClick={onTapReveal}
                className="mt-8 w-full min-h-[58px] px-5 rounded-xl bg-violet-600 hover:bg-violet-500 border-b-[3px] border-violet-800 active:border-b-0 active:translate-y-[2px] transition-all text-white font-display text-base sm:text-lg font-extrabold tracking-wider flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <Eye className="w-5 h-5 shrink-0" />
                <span>TAP TO GET YOUR WORD</span>
              </button>
            </div>

            {/* Card bottom index */}
            <div className="flex items-center justify-between font-mono text-xs text-zinc-600">
              <span>{playerLabel}</span>
              <span>HOLD PRIVATE</span>
            </div>
          </div>
        ) : isImposter ? (
          <div className="animate-reveal-pop rounded-2xl border border-red-500/50 bg-[#170C10] p-6 sm:p-8 flex flex-col justify-between min-h-[380px] shadow-2xl relative overflow-hidden">
            {/* Top red accent rule */}
            <div
              aria-hidden="true"
              className="absolute top-0 left-0 right-0 h-1.5 bg-red-600"
            />

            <div className="flex items-center justify-between font-mono text-xs text-red-400/90 pt-1">
              <span>{playerLabel}</span>
              <span>ROLE CARD</span>
            </div>

            <div className="my-auto py-6 text-center">
              <div className="font-display text-4xl sm:text-5xl font-extrabold tracking-[0.14em] text-red-500">
                IMPOSTER
              </div>

              <div className="mt-8 pt-6 border-t border-red-500/20">
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-400">
                  YOUR HINT
                </div>
                <div className="mt-2 font-display text-3xl sm:text-4xl font-extrabold tracking-wider text-white">
                  {getHintForDifficulty(session.wordEntry, hintDifficulty)}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between font-mono text-xs text-red-400/70">
              <span>DO NOT REVEAL</span>
              <span>{shortNum}</span>
            </div>
          </div>
        ) : (
          <div className="animate-reveal-pop rounded-2xl border border-violet-500/40 bg-[#13121E] p-6 sm:p-8 flex flex-col justify-between min-h-[380px] shadow-2xl relative overflow-hidden">
            {/* Top violet accent rule */}
            <div
              aria-hidden="true"
              className="absolute top-0 left-0 right-0 h-1.5 bg-violet-500"
            />

            <div className="flex items-center justify-between font-mono text-xs text-violet-300/90 pt-1">
              <span>{playerLabel}</span>
              <span>ROLE CARD</span>
            </div>

            <div className="my-auto py-6 text-center">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-300">
                YOUR SECRET WORD
              </div>
              <div className="mt-3 font-display text-4xl sm:text-5xl font-extrabold tracking-wider text-white break-words">
                {session.wordEntry.word}
              </div>
            </div>

            <div className="flex items-center justify-between font-mono text-xs text-zinc-500">
              <span>MEMORIZE &amp; HIDE</span>
              <span>{shortNum}</span>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Action */}
      <footer className="pb-2">
        {session.revealStep === 'SECRET' ? (
          <button
            type="button"
            onClick={onTapDone}
            className="w-full min-h-[58px] rounded-xl bg-white text-[#09090D] hover:bg-zinc-200 border-b-[3px] border-zinc-400 active:border-b-0 active:translate-y-[2px] transition-all font-display text-lg font-extrabold tracking-wider flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Check className="w-5 h-5 stroke-[2.75]" />
            <span>DONE</span>
          </button>
        ) : (
          <div className="h-[58px] flex items-center justify-center text-xs text-zinc-500">
            Hand phone to {playerLabel}
          </div>
        )}
      </footer>
    </div>
  );
};
