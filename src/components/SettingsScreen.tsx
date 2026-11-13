import React, { useState } from 'react';
import { ArrowLeft, Check, RotateCcw, Trash2 } from 'lucide-react';
import { ALL_CATEGORIES, WORD_LIBRARY } from '../data/words';
import type {
  GameSettings,
  HintDifficulty,
  WordCategory,
} from '../types/game';
import { MAX_PLAYERS, MIN_PLAYERS } from '../utils/gameEngine';
import { PWAInstallButton } from './PWAInstallButton';

interface SettingsScreenProps {
  settings: GameSettings;
  hasActiveSession: boolean;
  usedWordCount: number;
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
  desc: string;
}> = [
  { value: 'easy', label: 'Easy', desc: 'Clear direct clue (Default)' },
  { value: 'medium', label: 'Medium', desc: 'Subtle descriptive clue' },
  { value: 'hard', label: 'Hard', desc: 'Indirect single-concept clue' },
];

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  hasActiveSession,
  usedWordCount,
  onUpdateSettings,
  onResetCurrentGame,
  onClearHistory,
  onBack,
}) => {
  const [confirmClear, setConfirmClear] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const toggleCategory = (cat: WordCategory) => {
    const current = settings.selectedCategories;
    // Empty array means ALL categories are active
    if (current.length === 0) {
      // Deselecting one from All -> select all others
      onUpdateSettings({
        ...settings,
        selectedCategories: ALL_CATEGORIES.filter((c) => c !== cat),
      });
      return;
    }

    if (current.includes(cat)) {
      const next = current.filter((c) => c !== cat);
      // Never leave 0 categories: if user deselects last one, reset to All
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
        <span className="text-xs font-semibold uppercase tracking-widest text-violet-400">
          Settings
        </span>
        <div className="w-16" aria-hidden="true" />
      </header>

      <main className="flex-1 py-6 space-y-6">
        {feedbackMsg && (
          <div
            role="status"
            className="rounded-xl border border-violet-500/40 bg-violet-600/15 px-4 py-3 text-sm font-medium text-violet-200 flex items-center gap-2"
          >
            <Check className="w-4 h-4 text-violet-300 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Audio & Gameplay */}
          <section className="rounded-2xl border border-white/10 bg-[#12121A] p-6 space-y-5">
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
                  Offline synthesized chimes &amp; feedback
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
                    ? 'bg-violet-600 text-white'
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
                    ? 'bg-violet-600 text-white'
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
                <span className="font-mono text-sm font-bold text-violet-300 tabular-nums">
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
                className="w-full accent-violet-500 h-2 bg-white/10 rounded-lg cursor-pointer"
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
                          ? 'bg-violet-600 text-white'
                          : 'bg-[#191924] text-zinc-300 border border-white/8 hover:border-violet-500/40'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hint Difficulty */}
            <div className="pt-4 border-t border-white/8">
              <div className="text-sm font-semibold text-white mb-2.5">
                Hint Difficulty
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
                      className={`min-h-[46px] px-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        active
                          ? 'bg-violet-600 text-white'
                          : 'bg-[#191924] text-zinc-300 border border-white/8 hover:border-violet-500/40'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-xs text-zinc-400">
                {
                  DIFFICULTY_OPTIONS.find(
                    (d) => d.value === settings.hintDifficulty,
                  )?.desc
                }
              </p>
            </div>
          </section>

          {/* Word Categories & Storage */}
          <section className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-[#12121A] p-6">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="font-display text-lg font-bold text-white">
                    Word Categories
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {WORD_LIBRARY.length} words ·{' '}
                    {allSelected
                      ? 'All 25 categories enabled'
                      : `${settings.selectedCategories.length} of 25 selected`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateSettings({ ...settings, selectedCategories: [] })
                  }
                  className={`min-h-[40px] px-3 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    allSelected
                      ? 'bg-violet-600/25 text-violet-300 border border-violet-500/40'
                      : 'bg-[#191924] text-zinc-300 border border-white/10 hover:border-white/20'
                  }`}
                >
                  Select All
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[260px] overflow-y-auto pr-1">
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
                          ? 'bg-violet-600/18 border border-violet-500/40 text-white'
                          : 'bg-[#171720] border border-white/6 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      <span className="truncate">{category}</span>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Session & Data Management */}
            <div className="rounded-2xl border border-white/10 bg-[#12121A] p-6 space-y-3">
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
                className="w-full min-h-[48px] px-4 rounded-xl border border-white/10 bg-[#181822] hover:bg-[#20202D] disabled:opacity-40 disabled:pointer-events-none text-sm font-semibold text-zinc-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-violet-400" />
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
                    Clear Local Game History ({usedWordCount} words played)
                  </span>
                </button>
              ) : (
                <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 space-y-2.5">
                  <div className="text-xs text-red-200 text-center">
                    Clear all played word history and reset any active game?
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
