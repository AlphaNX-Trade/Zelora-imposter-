import React, { useEffect } from 'react';
import { Home, Play, Trash2, X } from 'lucide-react';

interface ExitGameButtonProps {
  onClick: () => void;
  label?: string;
}

export const ExitGameButton: React.FC<ExitGameButtonProps> = ({
  onClick,
  label = 'Exit',
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Cancel and exit game"
      className="min-h-[44px] px-3 rounded-xl border border-white/10 bg-[#12131D] hover:bg-red-500/12 hover:border-red-500/35 text-zinc-300 hover:text-red-200 active:scale-[0.97] transition-all inline-flex items-center justify-center gap-1.5 text-xs font-semibold tracking-wide cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 shrink-0"
    >
      <X className="w-4 h-4 shrink-0" />
      <span>{label}</span>
    </button>
  );
};

interface ExitGameModalProps {
  isOpen: boolean;
  roundNumber: number;
  onContinue: () => void;
  onSaveAndExit: () => void;
  onCancelGame: () => void;
}

export const ExitGameModal: React.FC<ExitGameModalProps> = ({
  isOpen,
  roundNumber,
  onContinue,
  onSaveAndExit,
  onCancelGame,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onContinue();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onContinue]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-game-title"
      onClick={onContinue}
    >
      <div
        className="animate-reveal-pop w-full max-w-sm gaming-card-neon rounded-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2">
          <h3
            id="exit-game-title"
            className="font-display text-lg font-extrabold tracking-wide text-white"
          >
            EXIT ROUND {String(roundNumber).padStart(2, '0')}?
          </h3>
          <button
            type="button"
            onClick={onContinue}
            aria-label="Close exit dialog"
            className="min-h-[40px] min-w-[40px] rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 inline-flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
          Pause and return to the home menu, or cancel this game session completely.
        </p>

        <div className="mt-5 space-y-2.5">
          <button
            type="button"
            onClick={onSaveAndExit}
            className="w-full min-h-[48px] px-4 rounded-xl gaming-btn-primary active:border-b-0 active:translate-y-[1px] transition-all text-white font-display text-sm font-bold tracking-wider flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4 shrink-0" />
            <span>SAVE &amp; EXIT TO HOME</span>
          </button>

          <button
            type="button"
            onClick={onCancelGame}
            className="w-full min-h-[48px] px-4 rounded-xl border border-red-500/35 bg-red-500/10 hover:bg-red-500/20 active:translate-y-[1px] transition-all text-red-200 font-display text-sm font-bold tracking-wider flex items-center justify-center gap-2 cursor-pointer"
          >
            <Trash2 className="w-4 h-4 shrink-0 text-red-400" />
            <span>CANCEL &amp; END GAME</span>
          </button>

          <button
            type="button"
            onClick={onContinue}
            className="w-full min-h-[46px] px-4 rounded-xl border border-white/10 bg-[#1B1B27] hover:bg-[#232332] transition-colors text-zinc-200 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 text-violet-400 fill-current shrink-0" />
            <span>CONTINUE PLAYING</span>
          </button>
        </div>
      </div>
    </div>
  );
};
