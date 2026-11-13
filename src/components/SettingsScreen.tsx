import React, { useState } from 'react';
import { ArrowLeft, Check, RotateCcw, Trash2 } from 'lucide-react';
import { ALL_CATEGORIES, WORD_LIBRARY } from '../data/words';
import type { GameSettings, HintDifficulty, WordCategory } from '../types/game';
import { MAX_PLAYERS, MIN_PLAYERS } from '../utils/gameEngine';
import { PWAInstallButton } from './PWAInstallButton';

interface SettingsScreenProps {
  settings: GameSettings;
  hasActiveSession: boolean;
  usedWordCount: number;
  historyCount: number;
  onUpdateSettings: (next: GameSettings) => void;
  onResetCurrentGame: () => void;
  onClearHistory: () => void;
  onBack: () => void;
}

const TIMER_OPTIONS = [
  { label: 'Off', value: 0 },
  { label: '30s', value: 30 },
  { label: '45s', value: 45 },
  { label: '60s', value: 60 },
  { label: '90s', value: 90 },
  { label: '120s', value: 120 },
];

const DIFFICULTY_OPTIONS: Array<{
  value: HintDifficulty;
  label: string;
  example: string;
  desc: string;
}> = [
  {
    value: 'easy',
    label: 'Easy',
    example: 'Hard Disk → Technology',
    desc: 'Broad category clue',
  },
  {
    value: 'medium',
    label: 'Medium',
    example: 'Hard Disk → Digital storage',
    desc: 'Indirect contextual clue',
  },
  {
    value: 'hard',
    label: 'Hard',
    example: 'Hard Disk → Where forgotten memories wait',
    desc: 'Abstract lateral clue',
  },
];

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  hasActiveSession,
  usedWordCount,
  historyCount,
  onUpdateSettings,
  onResetCurrentGame,
  onClearHistory,
  onBack,
}) => {
  const [confirmClear, setConfirmClear] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

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
      const next = current.filter((c) => c !== cat);
      onUpdateSettings({
        ...settings,
        selectedCategories: next,
      });
    } else {
      const next = [...current, cat];
      onUpdateSettings({
        ...settings,
        selectedCategories: next.length === ALL_CATEGORIES.length ? [] : next,
      });
    }
  };

  const showToast = (msg: string) => {
    setFeedbackMsg(msg);
    window.setTimeout(() => setFeedbackMsg(null), 2600);
  };

  const allSelected = settings.selectedCategories.length === 0;
  const activeDiff =
    DIFFICULTY_OPTIONS.find((d) => d.value === settings.hintDifficulty) ??
    DIFFICULTY_OPTIONS[0];

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
        <span className="text-xs font-semibold uppercase tracking-widest text-sky-400">
          Settings
        </span>
        <div className="w-16" aria-hidden="true" />
      </header>

      <main className="flex-1 py-6 space-y-6">
        {feedbackMsg && (
          <div
            role="status"
            className="rounded-xl border border-sky-400/40 bg-sky-500/15 px-4 py-3 text-sm font-medium text-sky-100 flex items-center gap-2"
          >
            <Check className="w-4 h-4 text-sky-300 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Audio & Gameplay */}
          <section className="gaming-card rounded-2xl p-6 space-y-5">
            <h2 className="font-display text-lg font-bold text-white">
              Audio &amp; Gameplay
            </h2>

            {/* Sound Effects Toggle */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-white">
                  Sound Effects
                </div>
                <div className="text-xs text-zinc-400">
                  Offline chimes, win fanfare &amp; loss stings
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.soundEnabled}
                onClick={() =>
                  onUpdateSettings({
                    ...settings,
                    soundEnabled: !settings.soundEnabled,
                  })
                }
                className={`min-h-[44px] min-w-[76px] rounded-xl px-3 text-xs font-bold tracking-wider transition-colors cursor-pointer ${
                  settings.soundEnabled
                    ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white'
                    : 'bg-[#1A1A24] text-zinc-400 border border-white/10'
                }`}
              >
                {settings.soundEnabled ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Background Music Toggle */}
            <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/8">
              <div>
                <div className="text-sm font-semibold text-white">
                  Background Music
                </div>
                <div className="text-xs text-zinc-400">
                  Subtle dark ambient synth pad
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.musicEnabled}
                onClick={() =>
                  onUpdateSettings({
                    ...settings,
                    musicEnabled: !settings.musicEnabled,
                  })
                }
                className={`min-h-[44px] min-w-[76px] rounded-xl px-3 text-xs font-bold tracking-wider transition-colors cursor-pointer ${
                  settings.musicEnabled
                    ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white'
                    : 'bg-[#1A1A24] text-zinc-400 border border-white/10'
                }`}
              >
                {settings.musicEnabled ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Default Player Count */}
            <div className="pt-4 border-t border-white/8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-white">
                  Default Player Count
                </span>
                <span className="font-mono text-sm font-bold text-sky-300 tabular-nums">
                  {settings.playerCount} Players
                </span>
              </div>
              <input
                type="range"
                min={MIN_PLAYERS}
                max={MAX_PLAYERS}
                value={settings.playerCount}
                onChange={(e) =>
                  onUpdateSettings({
                    ...settings,
                    playerCount: Number(e.target.value),
                  })
                }
                className="w-full zelora-range cursor-pointer"
              />
            </div>

            {/* Discussion Timer */}
            <div className="pt-4 border-t border-white/8">
              <div className="text-sm font-semibold text-white mb-2.5">
                Discussion Timer
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {TIMER_OPTIONS.map((opt) => {
                  const active = settings.discussionTimerSeconds === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() =>
                        onUpdateSettings({
                          ...settings,
                          discussionTimerSeconds: opt.value,
                        })
                      }
                      className={`min-h-[44px] rounded-xl text-xs font-mono font-bold tabular-nums transition-all cursor-pointer ${
                        active
                          ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white'
                          : 'bg-[#171926] text-zinc-300 border border-white/8 hover:border-sky-400/40'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Imposter Hint Difficulty */}
            <div className="pt-4 border-t border-white/8">
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="text-sm font-semibold text-white">
                  Imposter Hint Difficulty
                </span>
                <span className="text-xs font-semibold text-sky-300 uppercase">
                  {activeDiff.label}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {DIFFICULTY_OPTIONS.map((opt) => {
                  const active = settings.hintDifficulty === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() =>
                        onUpdateSettings({
                          ...settings,
                          hintDifficulty: opt.value,
                        })
                      }
                      aria-pressed={active}
                      className={`min-h-[48px] px-2 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        active
                          ? 'bg-violet-600/30 border border-sky-400/60 text-white'
                          : 'bg-[#171926] text-zinc-300 border border-white/8 hover:border-white/20'
                      }`}
                    >
                      <div>{opt.label}</div>
                      <div className="text-[10px] text-zinc-400 font-normal mt-0.5">
                        {opt.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="mt-2.5 text-xs text-zinc-400">
                Example ({activeDiff.label}):{' '}
                <span className="text-sky-200 font-medium">
                  {activeDiff.example}
                </span>
              </p>
            </div>
          </section>

          {/* Word Categories & Storage */}
          <section className="space-y-6">
            <div className="gaming-card rounded-2xl p-6">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="font-display text-lg font-bold text-white">
                    Word Categories
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {WORD_LIBRARY.length} words ·{' '}
                    {allSelected
                      ? `All ${ALL_CATEGORIES.length} categories enabled`
                      : `${settings.selectedCategories.length} of ${ALL_CATEGORIES.length} selected`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateSettings({ ...settings, selectedCategories: [] })
                  }
                  className={`min-h-[40px] px-3 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    allSelected
                      ? 'bg-sky-500/20 text-sky-200 border border-sky-400/45'
                      : 'bg-[#171926] text-zinc-300 border border-white/10 hover:border-white/20'
                  }`}
                >
                  Select All
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[260px] overflow-y-auto pr-1 zelora-scroll">
                {ALL_CATEGORIES.map((category) => {
                  const isSelected =
                    allSelected ||
                    settings.selectedCategories.includes(category);
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => toggleCategory(category)}
                      className={`min-h-[44px] px-2.5 py-2 rounded-xl text-xs font-medium text-left transition-all flex items-center justify-between gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-violet-600/20 border border-sky-400/40 text-white'
                          : 'bg-[#141622] border border-white/6 text-zinc-500 hover:text-zinc-300'
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

            {/* Session & Data Management */}
            <div className="gaming-card rounded-2xl p-6 space-y-3">
              <h2 className="font-display text-lg font-bold text-white">
                Game Data &amp; App
              </h2>

              <PWAInstallButton />

              <button
                type="button"
                disabled={!hasActiveSession}
                onClick={() => {
                  onResetCurrentGame();
                  showToast('Current game session reset.');
                }}
                className="w-full min-h-[48px] px-4 rounded-xl border border-white/10 bg-[#171926] hover:bg-[#1E2133] disabled:opacity-40 disabled:pointer-events-none text-sm font-semibold text-zinc-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-sky-400" />
                <span>Reset Current Game</span>
              </button>

              {!confirmClear ? (
                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  className="w-full min-h-[48px] px-4 rounded-xl border border-red-500/25 bg-red-500/8 hover:bg-red-500/15 text-sm font-semibold text-red-300 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>
                    Clear Local Game History ({usedWordCount} words · {historyCount} rounds)
                  </span>
                </button>
              ) : (
                <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 space-y-2.5">
                  <div className="text-xs text-red-200 text-center">
                    Clear all played word history, match history, and active game?
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
                        showToast('Local game history cleared.');
                      }}
                      className="min-h-[44px] rounded-lg bg-red-600 text-xs font-bold text-white cursor-pointer"
                    >
                      Confirm Clear
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};
