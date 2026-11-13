import { ALL_CATEGORIES } from '../data/words';
import type {
  GameHistoryRecord,
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
  HISTORY: 'zelora_imposter_history_v1',
} as const;

const MAX_HISTORY_ENTRIES = 100;

export const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  musicEnabled: false,
  discussionTimerSeconds: 60,
  playerCount: DEFAULT_PLAYERS,
  hintDifficulty: 'easy',
  selectedCategories: [],
  playerNames: {},
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

function sanitizePlayerNames(raw: unknown): Record<number, string> {
  if (!raw || typeof raw !== 'object') return {};
  const result: Record<number, string> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    const num = Number(key);
    if (
      Number.isInteger(num) &&
      num >= 1 &&
      num <= MAX_PLAYERS &&
      typeof value === 'string'
    ) {
      const trimmed = value.trim().slice(0, 18);
      if (trimmed.length > 0) {
        result[num] = trimmed;
      }
    }
  }
  return result;
}

export function loadSettings(): GameSettings {
  const storage = getStorage();
  if (!storage) return { ...DEFAULT_SETTINGS, playerNames: {} };
  try {
    const raw = storage.getItem(KEYS.SETTINGS);
    if (!raw) return { ...DEFAULT_SETTINGS, playerNames: {} };
    const parsed = JSON.parse(raw) as Partial<GameSettings>;
    if (!parsed || typeof parsed !== 'object') {
      return { ...DEFAULT_SETTINGS, playerNames: {} };
    }

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
      playerNames: sanitizePlayerNames(parsed.playerNames),
    };
  } catch {
    return { ...DEFAULT_SETTINGS, playerNames: {} };
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

export function loadGameHistory(): GameHistoryRecord[] {
  const storage = getStorage();
  if (!storage) return [];
  try {
    const raw = storage.getItem(KEYS.HISTORY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is GameHistoryRecord =>
        Boolean(item) &&
        typeof item === 'object' &&
        typeof item.id === 'string' &&
        typeof item.secretWord === 'string' &&
        typeof item.imposterLabel === 'string' &&
        typeof item.votedOutLabel === 'string' &&
        (item.winningSide === 'PLAYERS' || item.winningSide === 'IMPOSTER') &&
        typeof item.playedAt === 'number',
    );
  } catch {
    return [];
  }
}

export function appendGameHistory(
  record: GameHistoryRecord,
): GameHistoryRecord[] {
  const current = loadGameHistory();
  const next = [record, ...current.filter((item) => item.id !== record.id)].slice(
    0,
    MAX_HISTORY_ENTRIES,
  );
  const storage = getStorage();
  if (storage) {
    try {
      storage.setItem(KEYS.HISTORY, JSON.stringify(next));
    } catch {
      // Storage unavailable or full
    }
  }
  return next;
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
    typeof s.wordEntry.hint !== 'string' ||
    typeof s.wordEntry.mediumHint !== 'string' ||
    typeof s.wordEntry.hardHint !== 'string'
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
    parsed.playerNames = sanitizePlayerNames(parsed.playerNames);

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
    storage.removeItem(KEYS.HISTORY);
  } catch {
    // Ignore
  }
}
