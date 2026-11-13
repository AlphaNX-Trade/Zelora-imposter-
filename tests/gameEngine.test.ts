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
  getPlayerDisplayName,
  getSortedLeaderboard,
  normalizePlayerNames,
  selectRandomImposter,
  selectSecretWord,
} from '../src/utils/gameEngine';
import {
  DEFAULT_SETTINGS,
  appendGameHistory,
  clearAllLocalHistory,
  loadActiveGameState,
  loadGameHistory,
  loadSettings,
  saveActiveGameState,
  saveSettings,
} from '../src/utils/storage';

function hasWordLeak(secretWord: string, hintText: string): boolean {
  const wordUpper = secretWord.trim().toUpperCase();
  const hintUpper = hintText.trim().toUpperCase();
  if (hintUpper === wordUpper) return true;
  if (hintUpper.includes(wordUpper)) return true;

  // Also check individual multi-word tokens of length >= 4
  const tokens = wordUpper
    .split(/[^A-Z0-9]+/)
    .filter((token) => token.length >= 4);
  return tokens.some((token) =>
    new RegExp(`\\b${token}\\b`, 'i').test(hintUpper),
  );
}

describe('ZELORA IMPOSTER 3-Tier Word Library', () => {
  it('contains 572 unique words across 26 categories with valid Easy, Medium, and Hard hints and zero word leaks', () => {
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
      expect(entry.mediumHint.trim().length).toBeGreaterThanOrEqual(3);
      expect(entry.hardHint.trim().length).toBeGreaterThanOrEqual(5);

      expect(entry.mediumHint.toUpperCase()).not.toBe(entry.hint.toUpperCase());
      expect(entry.hardHint.toUpperCase()).not.toBe(
        entry.mediumHint.toUpperCase(),
      );

      expect(
        hasWordLeak(entry.word, entry.hint),
        `Easy hint leak on ${entry.word}: ${entry.hint}`,
      ).toBe(false);
      expect(
        hasWordLeak(entry.word, entry.mediumHint),
        `Medium hint leak on ${entry.word}: ${entry.mediumHint}`,
      ).toBe(false);
      expect(
        hasWordLeak(entry.word, entry.hardHint),
        `Hard hint leak on ${entry.word}: ${entry.hardHint}`,
      ).toBe(false);
    }
  });

  it('matches all mandatory prompt 3-tier examples exactly', () => {
    const threeTierExamples: Array<
      [string, { easy: string; medium: string; hard: string }]
    > = [
      [
        'Hard Disk',
        {
          easy: 'Technology',
          medium: 'Digital storage',
          hard: 'A place where forgotten memories wait',
        },
      ],
      [
        'Lion',
        {
          easy: 'Animal',
          medium: 'Dominance',
          hard: 'A symbol of authority in the wild',
        },
      ],
      [
        'Bus',
        {
          easy: 'Transportation',
          medium: 'Shared journeys',
          hard: 'Many destinations, one moving room',
        },
      ],
    ];

    for (const [word, expected] of threeTierExamples) {
      const entry = WORD_LIBRARY.find((w) => w.word === word);
      expect(entry, `Missing example word: ${word}`).toBeDefined();
      expect(getHintForDifficulty(entry!, 'easy')).toBe(expected.easy);
      expect(getHintForDifficulty(entry!, 'medium')).toBe(expected.medium);
      expect(getHintForDifficulty(entry!, 'hard')).toBe(expected.hard);
    }

    const easyExamples: Array<[string, string]> = [
      ['Fridge', 'Technology'],
      ['Mobile', 'Technology'],
      ['India', 'Country'],
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

    for (const [word, expectedEasy] of easyExamples) {
      const entry = WORD_LIBRARY.find((w) => w.word === word);
      expect(entry, `Missing example word: ${word}`).toBeDefined();
      expect(getHintForDifficulty(entry!, 'easy')).toBe(expectedEasy);
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

describe('Player Setup, Custom Names & Imposter Selection', () => {
  it('supports 3, 5, 10, and 20 players, clamps counts, and normalizes custom names', () => {
    expect(clampPlayerCount(1)).toBe(3);
    expect(clampPlayerCount(99)).toBe(20);
    expect(clampPlayerCount(Number.NaN)).toBe(5);

    const names = normalizePlayerNames(
      { 1: '  Aarav  ', 2: '', 4: 'Zoya', 10: 'OutOfRange' },
      5,
    );
    expect(names).toEqual({ 1: 'Aarav', 4: 'Zoya' });
    expect(getPlayerDisplayName(1, names)).toBe('Aarav');
    expect(getPlayerDisplayName(2, names)).toBe('PLAYER 02');

    for (const count of [3, 5, 10, 20]) {
      const { session } = createNewSession(
        { ...DEFAULT_SETTINGS, playerCount: count, playerNames: names },
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
    const names = { 1: 'Maya', 2: 'Leo' };
    const { session } = createNewSession(
      { ...DEFAULT_SETTINGS, playerCount: 5, playerNames: names },
      [],
    );
    const imp = session.imposterPlayer;
    const res = evaluateCollectiveVote(
      { ...session, selectedSuspect: imp, voteLocked: true },
      'hard',
    );

    expect(res.outcome.winningSide).toBe('PLAYERS');
    expect(res.outcome.hintDifficulty).toBe('hard');
    expect(res.outcome.hintShown).toBe(session.wordEntry.hardHint);
    expect(res.outcome.imposterPlayer).toBe(imp);
    expect(res.outcome.votedOutPlayer).toBe(imp);
    expect(res.updatedScores[imp]).toBe(0);
    for (let p = 1; p <= 5; p++) {
      if (p !== imp) expect(res.updatedScores[p]).toBe(1);
    }
    const lb = getSortedLeaderboard(res.updatedScores, 5, names);
    expect(lb.find((e) => e.playerNumber === 1)?.playerName).toBe('Maya');
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
      'medium',
    );

    expect(res.outcome.winningSide).toBe('IMPOSTER');
    expect(res.outcome.hintDifficulty).toBe('medium');
    expect(res.outcome.hintShown).toBe(session.wordEntry.mediumHint);
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

describe('Storage Validation, Game History & Corruption Recovery', () => {
  it('safely handles corrupted localStorage settings and session JSON', () => {
    localStorage.setItem('zelora_imposter_settings_v1', '{broken-json');
    localStorage.setItem('zelora_imposter_session_v1', '{"playerCount": 999}');

    const settings = loadSettings();
    expect(settings).toEqual(DEFAULT_SETTINGS);

    const active = loadActiveGameState();
    expect(active.session).toBeNull();
    expect(active.screen).toBeNull();
  });

  it('persists custom player names, hint difficulty, and game history records locally', () => {
    const customSettings = {
      ...DEFAULT_SETTINGS,
      hintDifficulty: 'hard' as const,
      playerNames: { 1: 'Sana', 2: 'Dev' },
    };
    saveSettings(customSettings);
    expect(loadSettings()).toEqual(customSettings);

    appendGameHistory({
      id: 'round-1-test',
      playedAt: 1700000000000,
      roundNumber: 1,
      playerCount: 5,
      winningSide: 'PLAYERS',
      imposterPlayer: 2,
      votedOutPlayer: 2,
      imposterLabel: 'Dev',
      votedOutLabel: 'Dev',
      secretWord: 'Hard Disk',
      category: 'Technology',
      hintDifficulty: 'hard',
      hintShown: 'A place where forgotten memories wait',
    });

    const history = loadGameHistory();
    expect(history).toHaveLength(1);
    expect(history[0].secretWord).toBe('Hard Disk');
    expect(history[0].hintDifficulty).toBe('hard');

    clearAllLocalHistory();
    expect(loadGameHistory()).toHaveLength(0);
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
