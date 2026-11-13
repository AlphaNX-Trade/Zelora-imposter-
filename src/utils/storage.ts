import type { GameScreen, GameSession, GameSettings } from '../types/game';
import { DEFAULT_PLAYERS, clampPlayerCount } from './gameEngine';

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
        parsed.discussionTimerSeconds >= 0 &&
        parsed.discussionTimerSeconds <= 300
          ? parsed.discussionTimerSeconds
          : DEFAULT_SETTINGS.discussionTimerSeconds,
      playerCount:
        typeof parsed.playerCount === 'number'
          ? clampPlayerCount(parsed.playerCount)
          : DEFAULT_SETTINGS.playerCount,
      hintDifficulty:
        parsed.hintDifficulty === 'easy' ||
        parsed.hintDifficulty === 'medium' ||
        parsed.hintDifficulty === 'hard'
          ? parsed.hintDifficulty
          : DEFAULT_SETTINGS.hintDifficulty,
      selectedCategories: Array.isArray(parsed.selectedCategories)
        ? parsed.selectedCategories
        : [],
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
    // Ignore quota errors
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
    // Ignore quota errors
  }
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
    // Security & privacy guard: never persist an open SECRET step across reloads
    const sanitizedSession: GameSession = {
      ...session,
      revealStep: 'PROMPT',
    };
    storage.setItem(KEYS.SESSION, JSON.stringify(sanitizedSession));
    storage.setItem(KEYS.SCREEN, screen);
  } catch {
    // Ignore quota errors
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
    if (!rawSession || !rawScreen) return { session: null, screen: null };
    const session = JSON.parse(rawSession) as GameSession;
    if (
      !session ||
      typeof session.playerCount !== 'number' ||
      typeof session.imposterPlayer !== 'number' ||
      !session.wordEntry
    ) {
      return { session: null, screen: null };
    }
    // Always restore reveal screen at PROMPT step so nobody peaks on reload
    session.revealStep = 'PROMPT';
    const playableScreens: GameScreen[] = [
      'REVEAL',
      'DISCUSSION',
      'VOTING',
      'PRE_REVEAL',
      'TIE_NOTIFICATION',
      'RESULT',
    ];
    if (!playableScreens.includes(rawScreen)) {
      return { session: null, screen: null };
    }
    return { session, screen: rawScreen };
  } catch {
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
