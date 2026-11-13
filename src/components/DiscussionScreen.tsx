import React, { useEffect, useState } from 'react';
import { Pause, Play, RotateCcw, Vote } from 'lucide-react';
import { audioEngine } from '../utils/audio';
import { ExitGameButton } from './ExitGameControl';

interface DiscussionScreenProps {
  roundNumber: number;
  playerCount: number;
  timerDurationSeconds: number;
  onStartVoting: () => void;
  onRequestExit: () => void;
}

export const DiscussionScreen: React.FC<DiscussionScreenProps> = ({
  roundNumber,
  playerCount,
  timerDurationSeconds,
  onStartVoting,
  onRequestExit,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(timerDurationSeconds);
  const [isRunning, setIsRunning] = useState(timerDurationSeconds > 0);

  useEffect(() => {
    setSecondsLeft(timerDurationSeconds);
    setIsRunning(timerDurationSeconds > 0);
  }, [timerDurationSeconds, roundNumber]);

  useEffect(() => {
    if (!isRunning || timerDurationSeconds === 0) return;
    if (secondsLeft <= 0) {
      setIsRunning(false);
      return;
    }

    const id = window.setInterval(() => {
      setSecondsLeft((prev) => {
        const next = prev - 1;
        if (next > 0 && next <= 5) {
          audioEngine.playTimerTick();
        } else if (next === 0) {
          audioEngine.playTimerEnd();
        }
        return Math.max(0, next);
      });
    }, 1000);

    return () => window.clearInterval(id);
  }, [isRunning, secondsLeft, timerDurationSeconds]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  const isTimeUp = timerDurationSeconds > 0 && secondsLeft === 0;
  const isLow = timerDurationSeconds > 0 && secondsLeft > 0 && secondsLeft <= 10;

  return (
    <div className="safe-screen flex flex-col justify-between max-w-xl mx-auto w-full">
      <header className="flex items-center justify-between gap-3 text-xs text-zinc-400">
        <div className="flex items-center gap-3">
          <span className="font-semibold uppercase tracking-[0.18em] text-violet-400">
            Round {String(roundNumber).padStart(2, '0')}
          </span>
          <span className="font-mono tabular-nums text-zinc-500">
            {playerCount} Players
          </span>
        </div>
        <ExitGameButton onClick={onRequestExit} />
      </header>

      <main className="my-auto py-6 text-center space-y-6">
        <div className="animate-reveal-pop rounded-2xl border border-white/12 bg-[#12121A] p-7 sm:p-9 shadow-2xl">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-400">
            DISCUSSION TIME
          </div>
          <h2 className="mt-3 font-display text-2xl sm:text-3xl font-extrabold tracking-wide text-white text-balance">
            EVERYONE HAS RECEIVED THEIR WORD!
          </h2>
          <p className="mt-3 text-base text-zinc-300 font-medium">
            Discuss carefully. Find the imposter!
          </p>
          <p className="mt-1.5 text-sm text-zinc-400">
            Talk with everyone and identify suspicious players.
          </p>

          {timerDurationSeconds > 0 ? (
            <div className="mt-7 pt-6 border-t border-white/8">
              <div
                className={`font-mono text-5xl sm:text-6xl font-bold tracking-tight tabular-nums transition-colors ${
                  isTimeUp
                    ? 'text-amber-400'
                    : isLow
                      ? 'text-red-400'
                      : 'text-white'
                }`}
              >
                {formattedTime}
              </div>
              <div className="mt-1.5 text-xs text-zinc-400">
                {isTimeUp
                  ? 'Time is up — tap Start Voting when ready'
                  : isRunning
                    ? 'Countdown running'
                    : 'Paused'}
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsRunning((r) => !r)}
                  disabled={secondsLeft === 0}
                  className="min-h-[44px] px-4 rounded-xl border border-white/10 bg-[#191924] hover:bg-[#222230] disabled:opacity-40 text-sm font-semibold text-zinc-100 inline-flex items-center gap-2 cursor-pointer"
                >
                  {isRunning ? (
                    <>
                      <Pause className="w-4 h-4 text-violet-400" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 text-violet-400" />
                      <span>Resume</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setSecondsLeft((s) => Math.min(300, s + 15))}
                  className="min-h-[44px] px-4 rounded-xl border border-white/10 bg-[#191924] hover:bg-[#222230] text-sm font-semibold text-zinc-100 font-mono tabular-nums cursor-pointer"
                >
                  +15s
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSecondsLeft(timerDurationSeconds);
                    setIsRunning(true);
                  }}
                  className="min-h-[44px] px-4 rounded-xl border border-white/10 bg-[#191924] hover:bg-[#222230] text-sm font-semibold text-zinc-100 inline-flex items-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-zinc-400" />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-6 pt-5 border-t border-white/8 text-sm text-zinc-400">
              No timer · Tap Start Voting when everyone is ready
            </div>
          )}
        </div>
      </main>

      <footer className="space-y-4 pb-2">
        <button
          type="button"
          onClick={onStartVoting}
          className="w-full min-h-[58px] rounded-xl bg-violet-600 hover:bg-violet-500 border-b-[3px] border-violet-800 active:border-b-0 active:translate-y-[2px] transition-all text-white font-display text-lg font-extrabold tracking-wider flex items-center justify-center gap-2.5 cursor-pointer"
        >
          <Vote className="w-5 h-5" />
          <span>START VOTING</span>
        </button>

        <div className="text-center text-xs text-zinc-500">
          <span>Developed by Zelora</span>
          <span aria-hidden="true" className="mx-2">
            ·
          </span>
          <span>v1.0.0</span>
        </div>
      </footer>
    </div>
  );
};
