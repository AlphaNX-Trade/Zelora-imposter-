import { WORD_LIBRARY } from '../data/words';
import type {
  GameSession,
  GameSettings,
  HintDifficulty,
  LeaderboardEntry,
  RoundOutcome,
  WordCategory,
  WordEntry,
} from '../types/game';

export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 20;
export const DEFAULT_PLAYERS = 5;

export function formatPlayerNumber(playerNumber: number): string {
  return `PLAYER ${String(playerNumber).padStart(2, '0')}`;
}

export function clampPlayerCount(count: number): number {
  if (!Number.isFinite(count)) return DEFAULT_PLAYERS;
  return Math.max(MIN_PLAYERS, Math.min(MAX_PLAYERS, Math.round(count)));
}

/**
 * Unbiased cryptographic random integer in [0, maxExclusive).
 * Ensures every player has strictly equal probability of selection.
 */
export function getSecureRandomInt(maxExclusive: number): number {
  if (maxExclusive <= 1) return 0;

  const cryptoObj =
    typeof globalThis !== 'undefined' &&
    typeof globalThis.crypto?.getRandomValues === 'function'
      ? globalThis.crypto
      : null;

  if (!cryptoObj) {
    return Math.floor(Math.random() * maxExclusive);
  }

  const maxUint32 = 0xffffffff;
  const limit = maxUint32 - (maxUint32 % maxExclusive);
  const buffer = new Uint32Array(1);

  while (true) {
    cryptoObj.getRandomValues(buffer);
    const val = buffer[0];
    if (val < limit) {
      return val % maxExclusive;
    }
  }
}

export function selectRandomImposter(playerCount: number): number {
  const safeCount = clampPlayerCount(playerCount);
  return getSecureRandomInt(safeCount) + 1;
}

export function selectSecretWord(
  usedWordIds: string[],
  selectedCategories: WordCategory[],
): { wordEntry: WordEntry; updatedUsedIds: string[]; poolReset: boolean } {
  const categoryPool =
    selectedCategories.length > 0
      ? WORD_LIBRARY.filter((entry) => selectedCategories.includes(entry.category))
      : WORD_LIBRARY;

  const effectivePool = categoryPool.length > 0 ? categoryPool : WORD_LIBRARY;
  const usedSet = new Set(usedWordIds);
  let available = effectivePool.filter((entry) => !usedSet.has(entry.id));
  let poolReset = false;

  if (available.length === 0) {
    available = effectivePool;
    poolReset = true;
  }

  const chosen = available[getSecureRandomInt(available.length)];
  const poolIds = new Set(effectivePool.map((e) => e.id));
  const nextUsedIds = poolReset
    ? [...usedWordIds.filter((id) => !poolIds.has(id)), chosen.id]
    : [...usedWordIds, chosen.id];

  return {
    wordEntry: chosen,
    updatedUsedIds: nextUsedIds,
    poolReset,
  };
}

export function getHintForDifficulty(
  wordEntry: WordEntry,
  _difficulty: HintDifficulty,
): string {
  return wordEntry.hint;
}

export function createInitialScores(playerCount: number): Record<number, number> {
  const scores: Record<number, number> = {};
  for (let i = 1; i <= playerCount; i++) {
    scores[i] = 0;
  }
  return scores;
}

export function createNewSession(
  settings: GameSettings,
  usedWordIds: string[],
  existingScores?: Record<number, number>,
  roundNumber = 1,
): { session: GameSession; updatedUsedIds: string[] } {
  const playerCount = clampPlayerCount(settings.playerCount);
  const imposterPlayer = selectRandomImposter(playerCount);
  const { wordEntry, updatedUsedIds } = selectSecretWord(
    usedWordIds,
    settings.selectedCategories,
  );

  const scores = createInitialScores(playerCount);
  if (existingScores) {
    for (let i = 1; i <= playerCount; i++) {
      scores[i] = existingScores[i] ?? 0;
    }
  }

  return {
    session: {
      roundNumber,
      playerCount,
      imposterPlayer,
      wordEntry,
      revealIndex: 0,
      revealStep: 'PROMPT',
      selectedSuspect: null,
      voteLocked: false,
      scores,
      outcome: null,
    },
    updatedUsedIds,
  };
}

export function evaluateCollectiveVote(
  session: GameSession,
  hintDifficulty: HintDifficulty,
): { outcome: RoundOutcome; updatedScores: Record<number, number> } {
  const votedOutPlayer = session.selectedSuspect;
  if (
    votedOutPlayer === null ||
    !Number.isInteger(votedOutPlayer) ||
    votedOutPlayer < 1 ||
    votedOutPlayer > session.playerCount
  ) {
    throw new Error('Cannot evaluate round without a valid collective selection.');
  }

  const imposterCaught = votedOutPlayer === session.imposterPlayer;
  const updatedScores: Record<number, number> = { ...session.scores };

  if (imposterCaught) {
    for (let p = 1; p <= session.playerCount; p++) {
      if (p !== session.imposterPlayer) {
        updatedScores[p] = (updatedScores[p] ?? 0) + 1;
      }
    }
  } else {
    updatedScores[session.imposterPlayer] =
      (updatedScores[session.imposterPlayer] ?? 0) + 1;
  }

  const outcome: RoundOutcome = {
    roundNumber: session.roundNumber,
    winningSide: imposterCaught ? 'PLAYERS' : 'IMPOSTER',
    imposterPlayer: session.imposterPlayer,
    votedOutPlayer,
    secretWord: session.wordEntry.word,
    category: session.wordEntry.category,
    hintShown: getHintForDifficulty(session.wordEntry, hintDifficulty),
  };

  return {
    outcome,
    updatedScores,
  };
}

export function getSortedLeaderboard(
  scores: Record<number, number>,
  playerCount: number,
): LeaderboardEntry[] {
  const entries = Array.from({ length: playerCount }, (_, idx) => {
    const playerNumber = idx + 1;
    return {
      playerNumber,
      score: scores[playerNumber] ?? 0,
    };
  });

  entries.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.playerNumber - b.playerNumber;
  });

  return entries.map((entry, idx) => ({
    ...entry,
    rank: idx + 1,
  }));
}
