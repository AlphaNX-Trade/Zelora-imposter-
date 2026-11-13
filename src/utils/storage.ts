import { ALL_CATEGORIES } from '../data/words';
import type {
  GameScreen,
  GameSession,
  GameSettings,
  WordCategory,
} from '../types/game';
import {
  DEFAULT_PLAYERS,
  MAX_PLAYERS,
  MIN_PLAYERS,
  clampPlayerCount,
} from './gameEngine';

const KEYS = {
  SETTINGS: 'zelora_imposter_settings_v1',
  SESSION: 'zelora_imposter_session_v1',
  SCREEN: 'zelora_imposter_screen_v1',
  USED_WORDS: 'zelora_imposter_used_words_v1',
} as const;

export const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  musicEnabled: false,
  discussionTimerSeconds: 60,
  playerCount: DEFAULT_PLAYERS,
  hintDifficulty: 'easy',
  selectedCategories: [],
};

const VALID_CATEGORY_SET = new Set<string>(ALL_CATEGORIES);

function getStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
  } catch {
    return null;
  }
  return null;
}

export function loadSettings(): GameSettings {
  const storage = getStorage();
  if (!storage) return { ...DEFAULT_SETTINGS };
  try {
    const raw = storage.getItem(KEYS.SETTINGS);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<GameSettings>;
    if (!parsed || typeof parsed !== 'object') return { ...DEFAULT_SETTINGS };

    const validCategories = Array.isArray(parsed.selectedCategories)
      ? parsed.selectedCategories.filter(
          (cat): cat is WordCategory =>
            typeof cat === 'string' && VALID_CATEGORY_SET.has(cat),
        )
      : [];

    return {
      soundEnabled:
        typeof parsed.soundEnabled === 'boolean'
          ? parsed.soundEnabled
          : DEFAULT_SETTINGS.soundEnabled,
      musicEnabled:
        typeof parsed.musicEnabled === 'boolean'
          ? parsed.musicEnabled
          : DEFAULT_SETTINGS.musicEnabled,
      discussionTimerSeconds:
        typeof parsed.discussionTimerSeconds === 'number' &&
        Number.isFinite(parsed.discussionTimerSeconds) &&
        parsed.discussionTimerSeconds >= 0 &&
        parsed.discussionTimerSeconds <= 300
          ? parsed.discussionTimerSeconds
          : DEFAULT_SETTINGS.discussionTimerSeconds,
      playerCount:
        typeof parsed.playerCount === 'number' && Number.isFinite(parsed.playerCount)
          ? clampPlayerCount(parsed.playerCount)
          : DEFAULT_SETTINGS.playerCount,
      hintDifficulty:
        parsed.hintDifficulty === 'easy' ||
        parsed.hintDifficulty === 'medium' ||
        parsed.hintDifficulty === 'hard'
          ? parsed.hintDifficulty
          : DEFAULT_SETTINGS.hintDifficulty,
      selectedCategories: validCategories,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: GameSettings): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  } catch {
    // Storage unavailable or full
  }
}

export function loadUsedWordIds(): string[] {
  const storage = getStorage();
  if (!storage) return [];
  try {
    const raw = storage.getItem(KEYS.USED_WORDS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string')
      : [];
  } catch {
    return [];
  }
}

export function saveUsedWordIds(ids: string[]): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(KEYS.USED_WORDS, JSON.stringify(ids));
  } catch {
    // Storage unavailable or full
  }
}

function isValidSession(candidate: unknown): candidate is GameSession {
  if (!candidate || typeof candidate !== 'object') return false;
  const s = candidate as GameSession;

  if (
    !Number.isInteger(s.playerCount) ||
    s.playerCount < MIN_PLAYERS ||
    s.playerCount > MAX_PLAYERS
  ) {
    return false;
  }
  if (
    !Number.isInteger(s.imposterPlayer) ||
    s.imposterPlayer < 1 ||
    s.imposterPlayer > s.playerCount
  ) {
    return false;
  }
  if (!Number.isInteger(s.roundNumber) || s.roundNumber < 1) {
    return false;
  }
  if (
    !s.wordEntry ||
    typeof s.wordEntry.id !== 'string' ||
    typeof s.wordEntry.word !== 'string' ||
    typeof s.wordEntry.category !== 'string' ||
    typeof s.wordEntry.hint !== 'string'
  ) {
    return false;
  }
  if (
    !Number.isInteger(s.revealIndex) ||
    s.revealIndex < 0 ||
    s.revealIndex > s.playerCount
  ) {
    return false;
  }
  if (typeof s.voteLocked !== 'boolean') {
    return false;
  }
  if (
    s.selectedSuspect !== null &&
    (!Number.isInteger(s.selectedSuspect) ||
      s.selectedSuspect < 1 ||
      s.selectedSuspect > s.playerCount)
  ) {
    return false;
  }
  if (!s.scores || typeof s.scores !== 'object') return false;

  return true;
}

export function saveActiveGameState(
  session: GameSession | null,
  screen: GameScreen,
): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    if (!session) {
      storage.removeItem(KEYS.SESSION);
      storage.removeItem(KEYS.SCREEN);
      return;
    }
    const sanitizedSession: GameSession = {
      ...session,
      revealStep: 'PROMPT',
    };
    storage.setItem(KEYS.SESSION, JSON.stringify(sanitizedSession));
    storage.setItem(KEYS.SCREEN, screen);
  } catch {
    // Storage unavailable or full
  }
}

export function loadActiveGameState(): {
  session: GameSession | null;
  screen: GameScreen | null;
} {
  const storage = getStorage();
  if (!storage) return { session: null, screen: null };
  try {
    const rawSession = storage.getItem(KEYS.SESSION);
    const rawScreen = storage.getItem(KEYS.SCREEN) as GameScreen | null;
    if (!rawSession) return { session: null, screen: null };

    const parsed = JSON.parse(rawSession);
    if (!isValidSession(parsed)) {
      storage.removeItem(KEYS.SESSION);
      storage.removeItem(KEYS.SCREEN);
      return { session: null, screen: null };
    }

    parsed.revealStep = 'PROMPT';

    const validScreens: GameScreen[] = [
      'HOME',
      'REVEAL',
      'DISCUSSION',
      'VOTING',
      'PRE_REVEAL',
      'RESULT',
    ];
    let safeScreen: GameScreen =
      rawScreen && validScreens.includes(rawScreen) ? rawScreen : 'HOME';

    if (parsed.voteLocked && safeScreen === 'VOTING') {
      safeScreen = parsed.outcome ? 'RESULT' : 'PRE_REVEAL';
    }

    return { session: parsed, screen: safeScreen };
  } catch {
    storage.removeItem(KEYS.SESSION);
    storage.removeItem(KEYS.SCREEN);
    return { session: null, screen: null };
  }
}

export function clearSessionStorage(): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.removeItem(KEYS.SESSION);
    storage.removeItem(KEYS.SCREEN);
  } catch {
    // Ignore
  }
}

export function clearAllLocalHistory(): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.removeItem(KEYS.SESSION);
    storage.removeItem(KEYS.SCREEN);
    storage.removeItem(KEYS.USED_WORDS);
  } catch {
    // Ignore
  }
}
