import { describe, expect, it } from 'vitest';
import {
  ALL_CATEGORIES,
  CATEGORY_HINT_LABEL,
  WORD_LIBRARY,
} from '../src/data/words';
import {
  clampPlayerCount,
  createNewSession,
  evaluateCollectiveVote,
  formatPlayerNumber,
  getHintForDifficulty,
  getSortedLeaderboard,
  selectRandomImposter,
  selectSecretWord,
} from '../src/utils/gameEngine';
import {
  DEFAULT_SETTINGS,
  loadActiveGameState,
  loadSettings,
  saveActiveGameState,
} from '../src/utils/storage';

describe('ZELORA IMPOSTER Category Word Library', () => {
  it('contains 500+ unique words across all 26 categories with accurate category hints and zero word leaks', () => {
    expect(ALL_CATEGORIES).toHaveLength(26);
    expect(WORD_LIBRARY.length).toBeGreaterThanOrEqual(500);

    const seenIds = new Set<string>();
    const seenWords = new Set<string>();

    for (const entry of WORD_LIBRARY) {
      expect(seenIds.has(entry.id)).toBe(false);
      seenIds.add(entry.id);

      const wordUpper = entry.word.trim().toUpperCase();
      expect(seenWords.has(wordUpper)).toBe(false);
      seenWords.add(wordUpper);

      expect(ALL_CATEGORIES).toContain(entry.category);
      expect(entry.hint).toBe(CATEGORY_HINT_LABEL[entry.category]);

      const hintUpper = entry.hint.trim().toUpperCase();
      expect(hintUpper).not.toBe(wordUpper);
      expect(hintUpper.includes(wordUpper)).toBe(false);
      expect(wordUpper.includes(hintUpper)).toBe(false);
    }
  });

  it('matches all mandatory prompt examples with exact category hints', () => {
    const expectedExamples: Array<[string, string]> = [
      ['Hard Disk', 'Technology'],
      ['Fridge', 'Technology'],
      ['Lion', 'Animal'],
      ['Mobile', 'Technology'],
      ['India', 'Country'],
      ['Bus', 'Travel'],
      ['Cricket', 'Sports'],
      ['Apple', 'Fruit'],
      ['Doctor', 'Profession'],
      ['Ocean', 'Nature'],
      ['Pizza', 'Food'],
      ['Aeroplane', 'Travel'],
      ['Guitar', 'Musical Instrument'],
      ['Jupiter', 'Space'],
      ['School', 'Education'],
    ];

    for (const [word, expectedHint] of expectedExamples) {
      const entry = WORD_LIBRARY.find((w) => w.word === word);
      expect(entry, `Missing example word: ${word}`).toBeDefined();
      expect(entry?.hint).toBe(expectedHint);
    }
  });

  it('validates 52+ distinct words across all 26 categories for accurate category hints', () => {
    const sampledWords = ALL_CATEGORIES.flatMap((cat) =>
      WORD_LIBRARY.filter((w) => w.category === cat).slice(0, 2),
    );
    expect(sampledWords.length).toBe(52);

    for (const entry of sampledWords) {
      expect(getHintForDifficulty(entry, 'easy')).toBe(
        CATEGORY_HINT_LABEL[entry.category],
      );
      expect(getHintForDifficulty(entry, 'medium')).toBe(
        CATEGORY_HINT_LABEL[entry.category],
      );
      expect(getHintForDifficulty(entry, 'hard')).toBe(
        CATEGORY_HINT_LABEL[entry.category],
      );
    }
  });

  it('cycles through the entire pool without repeating before resetting', () => {
    let usedIds: string[] = [];
    const seen = new Set<string>();

    for (let i = 0; i < WORD_LIBRARY.length; i++) {
      const { wordEntry, updatedUsedIds, poolReset } = selectSecretWord(
        usedIds,
        [],
      );
      expect(poolReset).toBe(false);
      expect(seen.has(wordEntry.id)).toBe(false);
      seen.add(wordEntry.id);
      usedIds = updatedUsedIds;
    }

    const next = selectSecretWord(usedIds, []);
    expect(next.poolReset).toBe(true);
    expect(next.updatedUsedIds).toHaveLength(1);
  });

  it('respects selected category filtering including Birds', () => {
    const { wordEntry } = selectSecretWord([], ['Birds']);
    expect(wordEntry.category).toBe('Birds');
    expect(wordEntry.hint).toBe('Bird');
  });
});

describe('Player Setup & Imposter Selection', () => {
  it('supports 3, 5, 10, and 20 players and clamps out-of-range counts', () => {
    expect(clampPlayerCount(1)).toBe(3);
    expect(clampPlayerCount(99)).toBe(20);
    expect(clampPlayerCount(Number.NaN)).toBe(5);

    for (const count of [3, 5, 10, 20]) {
      const { session } = createNewSession(
        { ...DEFAULT_SETTINGS, playerCount: count },
        [],
      );
      expect(session.playerCount).toBe(count);
      expect(session.imposterPlayer).toBeGreaterThanOrEqual(1);
      expect(session.imposterPlayer).toBeLessThanOrEqual(count);
      expect(session.selectedSuspect).toBeNull();
      expect(session.voteLocked).toBe(false);
      expect(Object.keys(session.scores)).toHaveLength(count);
      expect(formatPlayerNumber(count)).toBe(
        `PLAYER ${String(count).padStart(2, '0')}`,
      );
    }
  });

  it('assigns imposter with uniform probability over 10,000 test rounds', () => {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const rounds = 10_000;
    for (let i = 0; i < rounds; i++) {
      const imp = selectRandomImposter(5);
      counts[imp]++;
    }
    for (let p = 1; p <= 5; p++) {
      const share = counts[p] / rounds;
      expect(share).toBeGreaterThan(0.175);
      expect(share).toBeLessThan(0.225);
    }
  });
});

describe('Collective Group Voting, Scoring, and Leaderboard', () => {
  it('throws if evaluated without a valid collective group selection', () => {
    const { session } = createNewSession(
      { ...DEFAULT_SETTINGS, playerCount: 5 },
      [],
    );
    expect(() => evaluateCollectiveVote(session, 'easy')).toThrow();
  });

  it('scores +1 to every innocent player and 0 to imposter when collective vote catches imposter', () => {
    const { session } = createNewSession(
      { ...DEFAULT_SETTINGS, playerCount: 5 },
      [],
    );
    const imp = session.imposterPlayer;
    const res = evaluateCollectiveVote(
      { ...session, selectedSuspect: imp, voteLocked: true },
      'easy',
    );

    expect(res.outcome.winningSide).toBe('PLAYERS');
    expect(res.outcome.imposterPlayer).toBe(imp);
    expect(res.outcome.votedOutPlayer).toBe(imp);
    expect(res.updatedScores[imp]).toBe(0);
    for (let p = 1; p <= 5; p++) {
      if (p !== imp) expect(res.updatedScores[p]).toBe(1);
    }
    const lb = getSortedLeaderboard(res.updatedScores, 5);
    expect(lb[lb.length - 1].playerNumber).toBe(imp);
    expect(lb[lb.length - 1].score).toBe(0);
  });

  it('scores +1 to imposter and 0 to others when collective vote picks wrong player', () => {
    const { session } = createNewSession(
      { ...DEFAULT_SETTINGS, playerCount: 5 },
      [],
    );
    const imp = session.imposterPlayer;
    const wrongSuspect = imp === 1 ? 2 : 1;

    const res = evaluateCollectiveVote(
      { ...session, selectedSuspect: wrongSuspect, voteLocked: true },
      'easy',
    );

    expect(res.outcome.winningSide).toBe('IMPOSTER');
    expect(res.outcome.votedOutPlayer).toBe(wrongSuspect);
    expect(res.updatedScores[imp]).toBe(1);
    for (let p = 1; p <= 5; p++) {
      if (p !== imp) expect(res.updatedScores[p]).toBe(0);
    }
  });

  it('resets collective vote and preserves cumulative scores across new rounds', () => {
    const round2 = createNewSession(
      { ...DEFAULT_SETTINGS, playerCount: 5 },
      [],
      { 1: 3, 2: 1, 3: 2, 4: 0, 5: 1 },
      2,
    ).session;
    expect(round2.roundNumber).toBe(2);
    expect(round2.selectedSuspect).toBeNull();
    expect(round2.voteLocked).toBe(false);
    expect(round2.scores).toEqual({ 1: 3, 2: 1, 3: 2, 4: 0, 5: 1 });
  });
});

describe('Storage Validation & Corruption Recovery', () => {
  it('safely handles corrupted localStorage settings and session JSON', () => {
    localStorage.setItem('zelora_imposter_settings_v1', '{broken-json');
    localStorage.setItem('zelora_imposter_session_v1', '{"playerCount": 999}');

    const settings = loadSettings();
    expect(settings).toEqual(DEFAULT_SETTINGS);

    const active = loadActiveGameState();
    expect(active.session).toBeNull();
    expect(active.screen).toBeNull();
  });

  it('sanitizes secret reveal step on save/load and prevents returning to voting once locked', () => {
    const { session } = createNewSession(DEFAULT_SETTINGS, []);
    const exposedSession = { ...session, revealStep: 'SECRET' as const };
    saveActiveGameState(exposedSession, 'REVEAL');

    const loaded = loadActiveGameState();
    expect(loaded.session).not.toBeNull();
    expect(loaded.session?.revealStep).toBe('PROMPT');
    expect(loaded.screen).toBe('REVEAL');

    // Locked collective vote recovered from VOTING routes straight to PRE_REVEAL
    saveActiveGameState(
      { ...session, selectedSuspect: 2, voteLocked: true },
      'VOTING',
    );
    const lockedLoad = loadActiveGameState();
    expect(lockedLoad.screen).toBe('PRE_REVEAL');
  });
});
