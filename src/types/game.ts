export type HintDifficulty = 'easy' | 'medium' | 'hard';

export type WordCategory =
  | 'Technology'
  | 'Electronics'
  | 'Animals'
  | 'Birds'
  | 'Countries'
  | 'Cities'
  | 'Travel'
  | 'Transportation'
  | 'Food'
  | 'Fruits'
  | 'Vegetables'
  | 'Drinks'
  | 'Sports'
  | 'Nature'
  | 'Science'
  | 'Space'
  | 'Professions'
  | 'Education'
  | 'Entertainment'
  | 'Movies'
  | 'Business'
  | 'Clothing'
  | 'Musical Instruments'
  | 'Household Objects'
  | 'Buildings'
  | 'Everyday Objects';

export interface WordEntry {
  id: string;
  word: string;
  category: WordCategory;
  hint: string;
  difficulty: HintDifficulty;
}

export type GameScreen =
  | 'HOME'
  | 'SETUP'
  | 'REVEAL'
  | 'DISCUSSION'
  | 'VOTING'
  | 'PRE_REVEAL'
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
}

export interface GameSession {
  roundNumber: number;
  playerCount: number;
  imposterPlayer: number; // 1-based player number
  wordEntry: WordEntry;
  revealIndex: number; // 0-based index into players (0 .. playerCount - 1)
  revealStep: 'PROMPT' | 'SECRET';
  // Collective single-vote state for the entire group
  selectedSuspect: number | null;
  voteLocked: boolean;
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
