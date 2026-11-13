import React, { useState } from 'react';
import {
  ArrowLeft,
  Check,
  Edit3,
  Layers,
  Minus,
  Play,
  Plus,
  RotateCcw,
  Sparkles,
  Users,
} from 'lucide-react';
import { ALL_CATEGORIES } from '../data/words';
import type { GameSettings, HintDifficulty, WordCategory } from '../types/game';
import {
  MAX_PLAYERS,
  MIN_PLAYERS,
  formatPlayerNumber,
} from '../utils/gameEngine';

interface SetupScreenProps {
  playerCount: number;
  settings: GameSettings;
  onChangePlayerCount: (count: number) => void;
  onUpdateSettings: (next: GameSettings) => void;
  onStartGame: () => void;
  onBack: () => void;
}

const PRESET_COUNTS = [3, 5, 8, 12, 20];
const DIFFICULTIES: Array<{
  id: HintDifficulty;
  label: string;
  desc: string;
}> = [
  { id: 'easy', label: 'Easy', desc: 'Broad category' },
  { id: 'medium', label: 'Medium', desc: 'Indirect clue' },
  { id: 'hard', label: 'Hard', desc: 'Abstract riddle' },
];

export const SetupScreen: React.FC<SetupScreenProps> = ({
  playerCount,
  settings,
  onChangePlayerCount,
  onUpdateSettings,
  onStartGame,
  onBack,
}) => {
  const [editingNames, setEditingNames] = useState(false);
  const [showCategories, setShowCategories] = useState(false);

  const players = Array.from({ length: playerCount }, (_, idx) => idx + 1);
  const allCategoriesSelected = settings.selectedCategories.length === 0;

  const handleNameChange = (playerNum: number, value: string) => {
    const nextNames = { ...settings.playerNames };
    if (value.trim().length === 0) {
      delete nextNames[playerNum];
    } else {
      nextNames[playerNum] = value.slice(0, 18);
    }
    onUpdateSettings({
      ...settings,
      playerNames: nextNames,
    });
  };

  const toggleCategory = (cat: WordCategory) => {
    const current = settings.selectedCategories;
    if (current.length === 0) {
      onUpdateSettings({
        ...settings,
        selectedCategories: ALL_CATEGORIES.filter((c) => c !== cat),
      });
      return;
    }
    if (current.includes(cat)) {
      onUpdateSettings({
        ...settings,
        selectedCategories: current.filter((c) => c !== cat),
      });
    } else {
      const next = [...current, cat];
      onUpdateSettings({
        ...settings,
        selectedCategories: next.length === ALL_CATEGORIES.length ? [] : next,
      });
    }
  };

  return (
    <div className="safe-screen flex flex-col max-w-4xl mx-auto w-full">
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
          Game Setup
        </span>
        <div className="w-16" aria-hidden="true" />
      </header>

      <main className="flex-1 flex flex-col justify-between py-5 gap-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
          {/* Player Count + Hint Difficulty */}
          <div className="md:col-span-5 space-y-5">
            <section className="gaming-card rounded-2xl p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-bold text-white">
                  Select Players
                </h2>
                <Users className="w-5 h-5 text-sky-400" />
              </div>
              <p className="mt-1 text-sm text-zinc-400">
                Choose 3 to 20 players for one-device play.
              </p>

              <div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#0A0B12] p-3">
                <button
                  type="button"
                  onClick={() =>
                    onChangePlayerCount(Math.max(MIN_PLAYERS, playerCount - 1))
                  }
                  disabled={playerCount <= MIN_PLAYERS}
                  className="min-h-[52px] min-w-[52px] rounded-lg bg-[#161826] border border-white/10 text-white hover:bg-violet-600/25 hover:border-sky-400/40 disabled:opacity-35 disabled:pointer-events-none flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                  aria-label="Decrease players"
                >
                  <Minus className="w-5 h-5" />
                </button>

                <div className="text-center">
                  <div className="font-mono text-4xl font-bold text-white tabular-nums">
                    {String(playerCount).padStart(2, '0')}
                  </div>
                  <div className="text-xs text-sky-300/80 mt-0.5">
                    Players · 1 Imposter
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onChangePlayerCount(Math.min(MAX_PLAYERS, playerCount + 1))
                  }
                  disabled={playerCount >= MAX_PLAYERS}
                  className="min-h-[52px] min-w-[52px] rounded-lg bg-[#161826] border border-white/10 text-white hover:bg-violet-600/25 hover:border-sky-400/40 disabled:opacity-35 disabled:pointer-events-none flex items-center justify-center transition-all active:scale-95 cursor-pointer"
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
                  className="w-full zelora-range cursor-pointer"
                />
                <div className="mt-2 flex justify-between text-xs font-mono text-zinc-500 tabular-nums">
                  <span>03</span>
                  <span>10</span>
                  <span>20</span>
                </div>
              </div>

              <div className="mt-4">
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
                            ? 'bg-gradient-to-br from-violet-600 to-blue-600 text-white shadow-[0_0_16px_-4px_rgba(99,102,241,0.7)]'
                            : 'bg-[#171926] text-zinc-300 border border-white/8 hover:border-sky-400/40'
                        }`}
                      >
                        {preset}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Quick Hint Difficulty Card */}
            <section className="gaming-card rounded-2xl p-5">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-display text-base font-bold text-white">
                  Imposter Hint Difficulty
                </h2>
                <Sparkles className="w-4 h-4 text-violet-400" />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {DIFFICULTIES.map((diff) => {
                  const active = settings.hintDifficulty === diff.id;
                  return (
                    <button
                      key={diff.id}
                      type="button"
                      onClick={() =>
                        onUpdateSettings({
                          ...settings,
                          hintDifficulty: diff.id,
                        })
                      }
                      aria-pressed={active}
                      className={`min-h-[54px] px-2 py-2 rounded-xl text-center transition-all cursor-pointer ${
                        active
                          ? 'bg-violet-600/25 border border-sky-400/60 text-white'
                          : 'bg-[#171926] border border-white/8 text-zinc-300 hover:border-white/20'
                      }`}
                    >
                      <div className="font-display text-xs font-bold uppercase tracking-wider">
                        {diff.label}
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">
                        {diff.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Player Roster & Quick Category Filter */}
          <div className="md:col-span-7 space-y-5">
            <section className="gaming-card rounded-2xl p-5 sm:p-6">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="font-display text-lg font-bold text-white">
                    Player Roster
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {editingNames
                      ? 'Optional: customize seat names (saved locally).'
                      : `Start with ${settings.playerNames[1]?.trim() || 'Player 01'} and pass the phone.`}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {editingNames &&
                    Object.keys(settings.playerNames).length > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateSettings({ ...settings, playerNames: {} })
                        }
                        className="min-h-[38px] px-2.5 rounded-lg border border-white/10 bg-[#171926] text-xs text-zinc-300 hover:text-white inline-flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset</span>
                      </button>
                    )}
                  <button
                    type="button"
                    onClick={() => setEditingNames((prev) => !prev)}
                    className={`min-h-[38px] px-3 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                      editingNames
                        ? 'bg-sky-500/20 text-sky-200 border border-sky-400/45'
                        : 'bg-[#171926] text-zinc-300 border border-white/10 hover:border-white/20'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{editingNames ? 'Done Naming' : 'Edit Names'}</span>
                  </button>
                </div>
              </div>

              {editingNames ? (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[260px] overflow-y-auto pr-1 zelora-scroll">
                  {players.map((num) => {
                    const fallback = formatPlayerNumber(num);
                    return (
                      <label
                        key={num}
                        className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0D0F18] px-3 py-2 focus-within:border-sky-400/60"
                      >
                        <span className="font-mono text-[11px] font-bold text-violet-300 shrink-0">
                          #{String(num).padStart(2, '0')}
                        </span>
                        <input
                          type="text"
                          maxLength={18}
                          value={settings.playerNames[num] ?? ''}
                          onChange={(e) => handleNameChange(num, e.target.value)}
                          placeholder={fallback}
                          aria-label={`Name for ${fallback}`}
                          className="w-full bg-transparent text-sm font-medium text-white placeholder:text-zinc-500 focus:outline-none"
                        />
                      </label>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                  {players.map((num) => {
                    const custom = settings.playerNames[num]?.trim();
                    return (
                      <div
                        key={num}
                        className="rounded-xl border border-white/8 bg-[#161826] px-3 py-3 text-center font-mono text-xs sm:text-sm font-semibold tracking-wider text-zinc-100 tabular-nums truncate"
                      >
                        {custom || formatPlayerNumber(num)}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-5 pt-4 border-t border-white/8 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-400">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sky-300 font-semibold">
                    Hint: {settings.hintDifficulty.toUpperCase()}
                  </span>
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
                    {allCategoriesSelected
                      ? `All ${ALL_CATEGORIES.length}`
                      : `${settings.selectedCategories.length} Active`}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCategories((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 text-violet-300 hover:text-sky-300 font-semibold cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{showCategories ? 'Hide Categories' : 'Filter Categories'}</span>
                </button>
              </div>

              {showCategories && (
                <div className="mt-4 pt-4 border-t border-white/8 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">
                      Tap categories to include in this game
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateSettings({ ...settings, selectedCategories: [] })
                      }
                      className="text-sky-300 hover:text-sky-200 font-semibold cursor-pointer"
                    >
                      Select All
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[180px] overflow-y-auto pr-1 zelora-scroll">
                    {ALL_CATEGORIES.map((category) => {
                      const isSelected =
                        allCategoriesSelected ||
                        settings.selectedCategories.includes(category);
                      return (
                        <button
                          key={category}
                          type="button"
                          onClick={() => toggleCategory(category)}
                          className={`min-h-[40px] px-2.5 py-1.5 rounded-xl text-xs font-medium text-left transition-all flex items-center justify-between gap-1.5 cursor-pointer ${
                            isSelected
                              ? 'bg-violet-600/20 border border-sky-400/40 text-white'
                              : 'bg-[#131521] border border-white/6 text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          <span className="truncate">{category}</span>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>

        <div className="pt-1 pb-2">
          <button
            type="button"
            onClick={onStartGame}
            className="w-full min-h-[58px] rounded-xl gaming-btn-primary active:border-b-0 active:translate-y-[2px] transition-all text-white font-display text-lg font-extrabold tracking-wider flex items-center justify-center gap-3 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>START GAME</span>
          </button>
        </div>
      </main>
    </div>
  );
};
