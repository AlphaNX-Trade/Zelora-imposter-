import assert from 'node:assert/strict';
import { ALL_CATEGORIES, WORD_LIBRARY } from '../src/data/words';
import {
  createNewSession,
  evaluateVotingResult,
  formatPlayerNumber,
  getAllowedTargetsForVoter,
  getHintForDifficulty,
  getSortedLeaderboard,
  selectRandomImposter,
  selectSecretWord,
} from '../src/utils/gameEngine';
import { DEFAULT_SETTINGS } from '../src/utils/storage';

console.log('Running ZELORA IMPOSTER QA Verification Suite...\n');

// 1. Word Library Validation (500+ unique words, 25 categories, unique IDs, no hint leaks)
assert.equal(ALL_CATEGORIES.length, 25, 'Must have exactly 25 categories');
assert.ok(
  WORD_LIBRARY.length >= 500,
  `Expected >= 500 words, got ${WORD_LIBRARY.length}`,
);

const seenIds = new Set<string>();
const seenWords = new Set<string>();
for (const entry of WORD_LIBRARY) {
  assert.ok(!seenIds.has(entry.id), `Duplicate ID found: ${entry.id}`);
  seenIds.add(entry.id);

  const normalizedWord = entry.word.trim().toUpperCase();
  assert.ok(!seenWords.has(normalizedWord), `Duplicate word found: ${entry.word}`);
  seenWords.add(normalizedWord);

  for (const h of [entry.hint, entry.mediumHint, entry.hardHint]) {
    const normHint = h.trim().toUpperCase();
    assert.notEqual(
      normHint,
      normalizedWord,
      `Hint equals secret word for ${entry.word}`,
    );
    assert.ok(
      !normHint.includes(normalizedWord) && !normalizedWord.includes(normHint),
      `Hint "${normHint}" directly contains or is contained in word "${normalizedWord}"`,
    );
  }
}
console.log(
  `[PASS] Word Library: ${WORD_LIBRARY.length} unique words across ${ALL_CATEGORIES.length} categories, zero hint leaks.`,
);

// 2. Player Counts: 3, 5, 10, 20 players
for (const count of [3, 5, 10, 20]) {
  const { session } = createNewSession(
    { ...DEFAULT_SETTINGS, playerCount: count },
    [],
  );
  assert.equal(session.playerCount, count);
  assert.ok(
    session.imposterPlayer >= 1 && session.imposterPlayer <= count,
    `Imposter out of range for ${count} players`,
  );
  assert.equal(Object.keys(session.scores).length, count);
  assert.equal(formatPlayerNumber(count), `PLAYER ${String(count).padStart(2, '0')}`);
}
console.log('[PASS] Player Selection & Setup verified for 3, 5, 10, and 20 players.');

// 3. Equal Imposter Probability Check over 10,000 test rounds (5 players)
const freq: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
const ROUNDS = 10_000;
for (let i = 0; i < ROUNDS; i++) {
  const imp = selectRandomImposter(5);
  freq[imp] = (freq[imp] ?? 0) + 1;
}
for (let p = 1; p <= 5; p++) {
  const ratio = freq[p] / ROUNDS;
  assert.ok(
    ratio > 0.175 && ratio < 0.225,
    `Imposter distribution skewed for player ${p}: ${(ratio * 100).toFixed(2)}%`,
  );
}
console.log(
  `[PASS] Imposter probability distribution over ${ROUNDS} rounds:`,
  freq,
);

// 4. Non-repeating Word Selection until Pool Exhaustion
let usedIds: string[] = [];
const pickedSet = new Set<string>();
for (let i = 0; i < WORD_LIBRARY.length; i++) {
  const { wordEntry, updatedUsedIds, poolReset } = selectSecretWord(usedIds, []);
  assert.equal(poolReset, false, `Pool should not reset early at step ${i}`);
  assert.ok(!pickedSet.has(wordEntry.id), `Repeated word before pool exhaustion: ${wordEntry.word}`);
  pickedSet.add(wordEntry.id);
  usedIds = updatedUsedIds;
}
const afterExhaust = selectSecretWord(usedIds, []);
assert.equal(afterExhaust.poolReset, true, 'Pool should reset cleanly after all words used');
console.log('[PASS] Non-repeating word selection verified across full 550-word pool.');

// 5. Easy Hint Default Check
const sampleSession = createNewSession(DEFAULT_SETTINGS, []).session;
assert.equal(
  getHintForDifficulty(sampleSession.wordEntry, 'easy'),
  sampleSession.wordEntry.hint,
);
console.log('[PASS] Default EASY hint assignment verified.');

// 6. Self-vote prevention check
const allowedForP2 = getAllowedTargetsForVoter(2, [1, 2, 3, 4, 5]);
assert.ok(!allowedForP2.includes(2), 'Voter must not be allowed to vote for self');
assert.equal(allowedForP2.length, 4);
console.log('[PASS] Self-voting prevention verified.');

// 7. Correct Vote Scoring & Leaderboard
{
  const { session } = createNewSession({ ...DEFAULT_SETTINGS, playerCount: 5 }, []);
  const imp = session.imposterPlayer;
  const votes: Record<number, number> = {};
  for (let p = 1; p <= 5; p++) {
    votes[p] = p === imp ? (imp === 1 ? 2 : 1) : imp;
  }
  const votedSession = { ...session, votes };
  const result = evaluateVotingResult(votedSession, 'easy');
  assert.equal(result.isTie, false);
  if (!result.isTie) {
    assert.equal(result.outcome.winningSide, 'PLAYERS');
    assert.equal(result.updatedScores[imp], 0);
    for (let p = 1; p <= 5; p++) {
      if (p !== imp) assert.equal(result.updatedScores[p], 1);
    }
    const lb = getSortedLeaderboard(result.updatedScores, 5);
    assert.equal(lb[4].playerNumber, imp);
    assert.equal(lb[4].score, 0);
  }
}
console.log('[PASS] Correct vote outcome, +1 innocent scoring, and leaderboard sorting verified.');

// 8. Wrong Vote Scoring
{
  const { session } = createNewSession({ ...DEFAULT_SETTINGS, playerCount: 5 }, []);
  const imp = session.imposterPlayer;
  const scapegoat = imp === 1 ? 2 : 1;
  const votes: Record<number, number> = {};
  for (let p = 1; p <= 5; p++) {
    votes[p] = p === scapegoat ? (scapegoat % 5) + 1 : scapegoat;
  }
  const votedSession = { ...session, votes };
  const result = evaluateVotingResult(votedSession, 'easy');
  assert.equal(result.isTie, false);
  if (!result.isTie) {
    assert.equal(result.outcome.winningSide, 'IMPOSTER');
    assert.equal(result.updatedScores[imp], 1);
    for (let p = 1; p <= 5; p++) {
      if (p !== imp) assert.equal(result.updatedScores[p], 0);
    }
  }
}
console.log('[PASS] Wrong vote outcome and +1 imposter scoring verified.');

// 9. Tie Detection & Cumulative Multiple Rounds
{
  const { session } = createNewSession({ ...DEFAULT_SETTINGS, playerCount: 4 }, []);
  const tieVotes: Record<number, number> = {
    1: 2,
    2: 1,
    3: 2,
    4: 1,
  };
  const tieEval = evaluateVotingResult({ ...session, votes: tieVotes }, 'easy');
  assert.equal(tieEval.isTie, true);
  if (tieEval.isTie) {
    assert.deepEqual(tieEval.tiedPlayers, [1, 2]);
  }

  // Next round preserves cumulative scores
  const round2 = createNewSession(
    { ...DEFAULT_SETTINGS, playerCount: 4 },
    [],
    { 1: 2, 2: 1, 3: 2, 4: 0 },
    2,
  ).session;
  assert.equal(round2.roundNumber, 2);
  assert.equal(round2.scores[1], 2);
  assert.equal(round2.scores[3], 2);
}
console.log('[PASS] Tie detection and multi-round cumulative score preservation verified.');

console.log('\nAll QA checks passed!');
