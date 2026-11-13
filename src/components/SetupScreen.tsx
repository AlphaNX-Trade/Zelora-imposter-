import React from 'react';
import { ArrowLeft, Minus, Play, Plus, Users } from 'lucide-react';
import type { GameSettings } from '../types/game';
import {
  MAX_PLAYERS,
  MIN_PLAYERS,
  formatPlayerNumber,
} from '../utils/gameEngine';

interface SetupScreenProps {
  playerCount: number;
  settings: GameSettings;
  onChangePlayerCount: (count: number) => void;
  onStartGame: () => void;
  onBack: () => void;
}

const PRESET_COUNTS = [3, 5, 8, 12, 20];

export const SetupScreen: React.FC<SetupScreenProps> = ({
  playerCount,
  settings,
  onChangePlayerCount,
  onStartGame,
  onBack,
}) => {
  const players = Array.from({ length: playerCount }, (_, idx) => idx + 1);

  return (
    <div className="min-h-[100dvh] flex flex-col px-5 py-6 sm:px-8 max-w-4xl mx-auto w-full">
      <header className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] px-3 -ml-2 inline-flex items-center gap-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-400">
          Player Setup
        </span>
        <div className="w-16" aria-hidden="true" />
      </header>

      <main className="flex-1 flex flex-col justify-between py-6 gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Player Count Selector */}
          <section className="lg:col-span-5 rounded-2xl border border-white/10 bg-[#12121A] p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-white">
                Select Players
              </h2>
              <Users className="w-5 h-5 text-violet-400" />
            </div>
            <p className="mt-1 text-sm text-zinc-400">
              Choose 3 to 20 players for one-device play.
            </p>

            <div className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-white/8 bg-[#0B0B11] p-3">
              <button
                type="button"
                onClick={() =>
                  onChangePlayerCount(Math.max(MIN_PLAYERS, playerCount - 1))
                }
                disabled={playerCount <= MIN_PLAYERS}
                className="min-h-[52px] min-w-[52px] rounded-lg bg-[#171722] border border-white/10 text-white hover:bg-violet-600/20 hover:border-violet-500/40 disabled:opacity-35 disabled:pointer-events-none flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                aria-label="Decrease players"
              >
                <Minus className="w-5 h-5" />
              </button>

              <div className="text-center">
                <div className="font-mono text-4xl font-bold text-white tabular-nums">
                  {String(playerCount).padStart(2, '0')}
                </div>
                <div className="text-xs text-zinc-400 mt-0.5">
                  Players · 1 Imposter
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  onChangePlayerCount(Math.min(MAX_PLAYERS, playerCount + 1))
                }
                disabled={playerCount >= MAX_PLAYERS}
                className="min-h-[52px] min-w-[52px] rounded-lg bg-[#171722] border border-white/10 text-white hover:bg-violet-600/20 hover:border-violet-500/40 disabled:opacity-35 disabled:pointer-events-none flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                aria-label="Increase players"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5">
              <input
                type="range"
                min={MIN_PLAYERS}
                max={MAX_PLAYERS}
                value={playerCount}
                onChange={(e) => onChangePlayerCount(Number(e.target.value))}
                aria-label="Number of players"
                className="w-full accent-violet-500 h-2 bg-white/10 rounded-lg cursor-pointer"
              />
              <div className="mt-2 flex justify-between text-xs font-mono text-zinc-500 tabular-nums">
                <span>03</span>
                <span>10</span>
                <span>20</span>
              </div>
            </div>

            <div className="mt-5">
              <div className="text-xs text-zinc-400 mb-2">Quick Select</div>
              <div className="grid grid-cols-5 gap-2">
                {PRESET_COUNTS.map((preset) => {
                  const active = playerCount === preset;
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => onChangePlayerCount(preset)}
                      className={`min-h-[44px] rounded-lg font-mono text-sm font-bold tabular-nums transition-all cursor-pointer ${
                        active
                          ? 'bg-violet-600 text-white'
                          : 'bg-[#191924] text-zinc-300 border border-white/8 hover:border-violet-500/40'
                      }`}
                    >
                      {preset}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Numbered Players Preview */}
          <section className="lg:col-span-7 rounded-2xl border border-white/10 bg-[#12121A] p-6">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-lg font-bold text-white">
                Seat Order
              </h2>
              <span className="text-xs text-zinc-400 tabular-nums">
                {playerCount} Seats
              </span>
            </div>
            <p className="mt-1 text-sm text-zinc-400">
              Start with Player 01 and pass the phone around the circle.
            </p>

            <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {players.map((num) => (
                <div
                  key={num}
                  className="rounded-lg border border-white/8 bg-[#181824] px-3 py-3 text-center font-mono text-xs sm:text-sm font-semibold tracking-wider text-zinc-100 tabular-nums"
                >
                  {formatPlayerNumber(num)}
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-white/8 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
              <span>Hint: {settings.hintDifficulty.toUpperCase()}</span>
              <span aria-hidden="true">·</span>
              <span>
                Timer:{' '}
                {settings.discussionTimerSeconds === 0
                  ? 'Off'
                  : `${settings.discussionTimerSeconds}s`}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                Categories:{' '}
                {settings.selectedCategories.length === 0
                  ? 'All 25'
                  : `${settings.selectedCategories.length} Active`}
              </span>
            </div>
          </section>
        </div>

        <div className="pt-2 pb-2">
          <button
            type="button"
            onClick={onStartGame}
            className="w-full min-h-[58px] rounded-xl bg-violet-600 hover:bg-violet-500 border-b-[3px] border-violet-800 active:border-b-0 active:translate-y-[2px] transition-all text-white font-display text-lg font-extrabold tracking-wider flex items-center justify-center gap-3 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>START GAME</span>
          </button>
        </div>
      </main>
    </div>
  );
};
