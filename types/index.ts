export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type PreferredLanguage = 'Python' | 'C' | 'Java' | 'C++';

export interface Problem {
  id: string;
  patternId: string;
  title: string;
  statement: string;
  difficulty: Difficulty;
  companyTags: string[];
  hints: string[];
  approach: string;
  solution: string;
  complexity: {
    time: string;
    space: string;
  };
  sampleInput: string;
  sampleOutput: string;
  inputLength: string;
  inputType: string;
  outputLength: string;
}

export interface Pattern {
  id: string;
  name: string;
  description: string;
  recognitionClues: string[];
  template: string;
  difficulty: Difficulty;
  problems: Problem[];
}

export interface UserProgress {
  problemId: string;
  status: 'unsolved' | 'solved' | 'needs-revision';
  attemptCount: number;
  lastSolvedAt: number; // timestamp
  revisionCount: number;
  masteryLevel: number; // 0-100
}

export interface PatternStats {
  patternId: string;
  masteryScore: number;
  problemsSolved: number;
  totalProblems: number;
}

export interface UserProfile {
  userId: string;
  userName: string;
  preferredLanguage: PreferredLanguage;
  hasCompletedOnboarding: boolean;
  email?: string;
  dailyGoal?: number;
}
