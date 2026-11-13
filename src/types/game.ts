export type HintDifficulty = 'easy' | 'medium' | 'hard';

export type WordCategory =
  | 'Animals'
  | 'Food'
  | 'Fruits'
  | 'Vegetables'
  | 'Drinks'
  | 'Sports'
  | 'Technology'
  | 'Electronics'
  | 'Transportation'
  | 'Countries'
  | 'Cities'
  | 'Nature'
  | 'Science'
  | 'Space'
  | 'Professions'
  | 'Household objects'
  | 'Education'
  | 'Entertainment'
  | 'Movies'
  | 'Business'
  | 'Travel'
  | 'Clothing'
  | 'Musical instruments'
  | 'Buildings'
  | 'Everyday objects';

export interface WordEntry {
  id: string;
  word: string;
  category: WordCategory;
  hint: string;
  mediumHint: string;
  hardHint: string;
  difficulty: HintDifficulty;
}

export type GameScreen =
  | 'HOME'
  | 'SETUP'
  | 'REVEAL'
  | 'DISCUSSION'
  | 'VOTING'
  | 'PRE_REVEAL'
  | 'TIE_NOTIFICATION'
  | 'RESULT'
  | 'HOW_TO_PLAY'
  | 'SETTINGS'
  | 'ABOUT';

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  discussionTimerSeconds: number; // 0 = disabled, default 60
  playerCount: number; // 3..20, default 5
  hintDifficulty: HintDifficulty; // default 'easy'
  selectedCategories: WordCategory[]; // empty = all categories
}

export interface RoundOutcome {
  roundNumber: number;
  winningSide: 'PLAYERS' | 'IMPOSTER';
  imposterPlayer: number;
  votedOutPlayer: number;
  secretWord: string;
  category: WordCategory;
  hintShown: string;
  voteCounts: Record<number, number>;
}

export interface GameSession {
  roundNumber: number;
  playerCount: number;
  imposterPlayer: number; // 1-based player number
  wordEntry: WordEntry;
  revealIndex: number; // 0-based index into players (0 .. playerCount - 1)
  revealStep: 'PROMPT' | 'SECRET';
  // Voting state
  voterIndex: number; // 0-based index into activeVoters
  votingHandoff: boolean; // privacy shield between voters
  votes: Record<number, number>; // voterPlayerNumber -> targetPlayerNumber
  candidatePool: number[]; // all players normally, or tied players during revote
  revoteRound: number;
  // Scores: playerNumber -> points
  scores: Record<number, number>;
  // Final computed outcome after REVEAL RESULT is tapped
  outcome: RoundOutcome | null;
}

export interface LeaderboardEntry {
  playerNumber: number;
  score: number;
  rank: number;
}
