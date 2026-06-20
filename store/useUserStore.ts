import { create } from 'zustand';
import { UserProgress, PatternStats, UserProfile } from '../types';
import { initDB, saveProgress, getProgress, saveProfile, getProfile, resetDatabase } from '../services/database';
import { PATTERNS } from '../data/patterns';
import { getSecureApiKey, saveSecureApiKey, deleteSecureApiKey, getLocalUsers, saveLocalUser, saveActiveEmail, getActiveEmail, deleteActiveEmail } from '../services/secureStore';
import { getAuthTokens, saveAuthTokens, clearAuthTokens, decodeJwtPayload } from '../services/auth';

interface RecommendationResult {
  pattern: typeof PATTERNS[number];
  problem: typeof PATTERNS[number]['problems'][number];
  mastery: number;
  lastPracticedText: string;
  reason: string;
  estTime: number;
  difficulty: string;
}

interface UserState {
  profile: UserProfile | null;
  progress: Record<string, UserProgress>;
  isAuthenticated: boolean;
  accessToken: string | null;
  activeTab: 'home' | 'patterns' | 'progress' | 'profile';
  initialize: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  toggleProblemStatus: (problemId: string, newStatus: 'unsolved' | 'solved' | 'needs-revision') => Promise<void>;
  solveProblem: (problemId: string) => Promise<void>;
  markForRevision: (problemId: string) => Promise<void>;
  unsolveProblem: (problemId: string) => Promise<void>;
  resetAllData: () => Promise<void>;
  login: (tokens: { accessToken: string; idToken?: string; refreshToken?: string }, progressList?: UserProgress[]) => Promise<void>;
  logout: () => Promise<void>;
  getNextPatternId: () => string | null;
  getNextProblemToSolve: () => { problemId: string; patternId: string } | null;
  getPatternMastery: (patternId: string) => number;
  getPatternStats: (patternId: string) => PatternStats;
  getFilteredProblems: (filter: 'all' | 'in-progress' | 'weakest' | 'revision-due') => Array<{ problemId: string; patternId: string }>;
  getRecommendation: () => RecommendationResult | null;
  setActiveTab: (tab: 'home' | 'patterns' | 'progress' | 'profile') => void;
}

const syncProgressToSecureStore = async (profile: UserProfile | null, progressMap: Record<string, UserProgress>) => {
  if (profile && profile.email) {
    const email = profile.email.toLowerCase().trim();
    const users = await getLocalUsers();
    const existing = users[email];
    if (existing) {
      await saveLocalUser(email, {
        passwordHash: existing.passwordHash,
        name: profile.userName,
        preferredLanguage: profile.preferredLanguage,
        hasCompletedOnboarding: profile.hasCompletedOnboarding,
        progress: Object.values(progressMap)
      });
    }
  }
};

export const useUserStore = create<UserState>((set, get) => ({
  profile: null,
  progress: {},
  isAuthenticated: false,
  accessToken: null,
  activeTab: 'home',
  setActiveTab: (tab) => set({ activeTab: tab }),

  initialize: async () => {
    await initDB();

    // Load auth status
    const { accessToken } = await getAuthTokens();
    const isAuthenticated = !!accessToken;
    
    // Load active email if any
    const activeEmail = await getActiveEmail();

    // Load Profile
    const savedProfile = await getProfile();
    const isOnboarded = savedProfile?.hasCompletedOnboarding || false;

    if (!isOnboarded) {
      // Clear any legacy progress/profiles if they haven't completed onboarding
      await resetDatabase();
      await deleteSecureApiKey().catch(() => {});
      await deleteActiveEmail().catch(() => {});
      
      const defaultProfile = {
        userId: `user_${Date.now()}`,
        userName: '',
        preferredLanguage: 'Python' as const,
        hasCompletedOnboarding: false
      };
      set({ profile: defaultProfile, progress: {}, isAuthenticated, accessToken });
    } else {
      const profileWithEmail = savedProfile ? {
        ...savedProfile,
        email: activeEmail || undefined
      } : null;
      set({ profile: profileWithEmail, isAuthenticated, accessToken });
      
      // Load Progress
      const savedProgress = await getProgress();
      const progressMap: Record<string, UserProgress> = {};
      savedProgress.forEach((p: any) => {
        progressMap[p.problemId] = p;
      });
      set({ progress: progressMap });
    }
  },

  updateProfile: async (updates) => {
    set((state) => {
      const newProfile = {
        ...(state.profile || { userId: `user_${Date.now()}`, userName: '', preferredLanguage: 'Python', hasCompletedOnboarding: false }),
        ...updates
      };
      
      saveProfile(newProfile);
      return { profile: newProfile };
    });
  },

  toggleProblemStatus: async (problemId, newStatus) => {
    const { progress } = get();
    const currentProgress = progress[problemId] || {
      problemId,
      status: 'unsolved' as const,
      attemptCount: 0,
      lastSolvedAt: 0,
      revisionCount: 0,
      masteryLevel: 0
    };

    const newProgress = {
      ...currentProgress,
      status: newStatus,
      attemptCount: currentProgress.attemptCount + (newStatus === 'solved' ? 1 : 0),
      lastSolvedAt: newStatus === 'solved' ? Date.now() : currentProgress.lastSolvedAt,
      revisionCount: newStatus === 'needs-revision' ? currentProgress.revisionCount + 1 : currentProgress.revisionCount,
      masteryLevel: Math.min(100, currentProgress.masteryLevel + (newStatus === 'solved' ? 15 : 0))
    };

    const updatedProgress = { ...progress, [problemId]: newProgress };
    set({ progress: updatedProgress });

    saveProgress(newProgress).catch((err) => console.error('Error saving progress:', err));
    syncProgressToSecureStore(get().profile, updatedProgress).catch((err) => console.error('Error syncing progress:', err));
  },

  solveProblem: async (problemId) => {
    const { progress } = get();
    const currentProgress = progress[problemId] || {
      problemId,
      status: 'unsolved' as const,
      attemptCount: 0,
      lastSolvedAt: 0,
      revisionCount: 0,
      masteryLevel: 0
    };

    const newProgress = {
      ...currentProgress,
      status: 'solved' as const,
      attemptCount: currentProgress.attemptCount + 1,
      lastSolvedAt: Date.now(),
      masteryLevel: Math.min(100, currentProgress.masteryLevel + 20)
    };

    const updatedProgress = { ...progress, [problemId]: newProgress };
    set({ progress: updatedProgress });

    saveProgress(newProgress).catch((err) => console.error('Error saving progress:', err));
    syncProgressToSecureStore(get().profile, updatedProgress).catch((err) => console.error('Error syncing progress:', err));
  },

  markForRevision: async (problemId) => {
    const { progress } = get();
    const currentProgress = progress[problemId] || {
      problemId,
      status: 'unsolved' as const,
      attemptCount: 0,
      lastSolvedAt: 0,
      revisionCount: 0,
      masteryLevel: 0
    };

    const newProgress = {
      ...currentProgress,
      status: 'needs-revision' as const,
      revisionCount: currentProgress.revisionCount + 1,
      masteryLevel: Math.max(0, currentProgress.masteryLevel - 10)
    };

    const updatedProgress = { ...progress, [problemId]: newProgress };
    set({ progress: updatedProgress });

    saveProgress(newProgress).catch((err) => console.error('Error saving progress:', err));
    syncProgressToSecureStore(get().profile, updatedProgress).catch((err) => console.error('Error syncing progress:', err));
  },

  unsolveProblem: async (problemId) => {
    const { progress } = get();
    const currentProgress = progress[problemId] || {
      problemId,
      status: 'unsolved' as const,
      attemptCount: 0,
      lastSolvedAt: 0,
      revisionCount: 0,
      masteryLevel: 0
    };

    const newProgress = {
      ...currentProgress,
      status: 'unsolved' as const,
      masteryLevel: 0,
      lastSolvedAt: 0
    };

    const updatedProgress = { ...progress, [problemId]: newProgress };
    set({ progress: updatedProgress });

    saveProgress(newProgress).catch((err) => console.error('Error saving progress:', err));
    syncProgressToSecureStore(get().profile, updatedProgress).catch((err) => console.error('Error syncing progress:', err));
  },

  getNextPatternId: () => {
    const { progress } = get();
    
    // First, find a pattern with problems to solve
    for (const pattern of PATTERNS) {
      const totalProblems = pattern.problems.length;
      const solvedCount = pattern.problems.filter(p => progress[p.id]?.status === 'solved').length;
      const inProgressCount = pattern.problems.filter(p => progress[p.id]?.status === 'unsolved' || !progress[p.id]).length;
      
      // Return next pattern only if current is fully solved
      if (solvedCount === totalProblems && inProgressCount === 0) {
        continue;
      }
      
      return pattern.id;
    }
    
    return null;
  },

  getNextProblemToSolve: () => {
    const { progress } = get();
    
    for (const pattern of PATTERNS) {
      const totalProblems = pattern.problems.length;
      const solvedCount = pattern.problems.filter(p => progress[p.id]?.status === 'solved').length;
      
      // Skip if pattern is fully solved
      if (solvedCount === totalProblems) {
        continue;
      }
      
      // Find first unsolved problem in this pattern
      const unsolvedProblem = pattern.problems.find(p => !progress[p.id] || progress[p.id].status !== 'solved');
      
      if (unsolvedProblem) {
        return {
          problemId: unsolvedProblem.id,
          patternId: pattern.id
        };
      }
    }
    
    return null;
  },

  getPatternMastery: (patternId) => {
    const { progress } = get();
    const pattern = PATTERNS.find(p => p.id === patternId);
    if (!pattern) return 0;

    const solved = pattern.problems.filter(p => progress[p.id]?.status === 'solved').length;
    return Math.round((solved / pattern.problems.length) * 100);
  },

  getPatternStats: (patternId) => {
    const { progress } = get();
    const pattern = PATTERNS.find(p => p.id === patternId);
    
    if (!pattern) {
      return {
        patternId,
        masteryScore: 0,
        problemsSolved: 0,
        totalProblems: 0
      };
    }

    const solved = pattern.problems.filter(p => progress[p.id]?.status === 'solved').length;
    
    return {
      patternId,
      masteryScore: Math.round((solved / pattern.problems.length) * 100),
      problemsSolved: solved,
      totalProblems: pattern.problems.length
    };
  },

  getFilteredProblems: (filter) => {
    const { progress } = get();
    const problems: Array<{ problemId: string; patternId: string }> = [];

    for (const pattern of PATTERNS) {
      for (const problem of pattern.problems) {
        const problemProgress = progress[problem.id];

        if (filter === 'all') {
          problems.push({ problemId: problem.id, patternId: pattern.id });
        } else if (filter === 'in-progress' && problemProgress?.status === 'unsolved') {
          problems.push({ problemId: problem.id, patternId: pattern.id });
        } else if (filter === 'revision-due' && problemProgress?.status === 'needs-revision') {
          problems.push({ problemId: problem.id, patternId: pattern.id });
        } else if (filter === 'weakest') {
          // Weakest = lowest mastery level that's either unsolved or needs revision
          if (!problemProgress || problemProgress.status !== 'solved') {
            problems.push({ problemId: problem.id, patternId: pattern.id });
          }
        }
      }
    }

    // Sort for weakest: by mastery level ascending
    if (filter === 'weakest') {
      problems.sort((a, b) => {
        const masteryA = progress[a.problemId]?.masteryLevel || 0;
        const masteryB = progress[b.problemId]?.masteryLevel || 0;
        return masteryA - masteryB;
      });
    }

    return problems;
  },

  getRecommendation: () => {
    const { progress, getPatternMastery } = get();
    if (PATTERNS.length === 0) return null;

    // Rank all patterns
    const scoredPatterns = PATTERNS.map(pattern => {
      const mastery = getPatternMastery(pattern.id);
      
      // Calculate days since last practice
      const solvedProblemsInPattern = pattern.problems.filter(p => progress[p.id]?.status === 'solved');
      let daysSinceLastPractice = 30; // Default high value if never practiced
      let lastSolvedTime = 0;
      
      if (solvedProblemsInPattern.length > 0) {
        const solvedTimestamps = solvedProblemsInPattern.map(p => progress[p.id].lastSolvedAt);
        lastSolvedTime = Math.max(...solvedTimestamps);
        daysSinceLastPractice = Math.max(0, (Date.now() - lastSolvedTime) / (1000 * 60 * 60 * 24));
      }
      
      // Revision due weight
      const revisionDueCount = pattern.problems.filter(p => progress[p.id]?.status === 'needs-revision').length;
      const revisionDueWeight = revisionDueCount * 15;
      
      // Failure weight: accumulation of attempts on unsolved problems
      const unsolvedProblems = pattern.problems.filter(p => !progress[p.id] || progress[p.id].status !== 'solved');
      const totalAttemptsOnUnsolved = unsolvedProblems.reduce((acc, p) => acc + (progress[p.id]?.attemptCount || 0), 0);
      const failureWeight = totalAttemptsOnUnsolved * 5;
      
      const patternScore = (100 - mastery) + daysSinceLastPractice + revisionDueWeight + failureWeight;
      
      return {
        pattern,
        mastery,
        daysSinceLastPractice,
        lastSolvedTime,
        revisionDueCount,
        patternScore
      };
    });

    // Sort by patternScore descending
    scoredPatterns.sort((a, b) => b.patternScore - a.patternScore);

    // Pick the highest scoring pattern
    for (const scored of scoredPatterns) {
      const { pattern, mastery, daysSinceLastPractice } = scored;
      
      // Priority within the pattern:
      // 1. Revision Due Problems
      const revisionDueProbs = pattern.problems.filter(p => progress[p.id]?.status === 'needs-revision');
      // 2. Unsolved Problems
      const unsolvedProbs = pattern.problems.filter(p => !progress[p.id] || progress[p.id].status === 'unsolved');
      // 3. Oldest Solved Problems
      const solvedProbs = pattern.problems.filter(p => progress[p.id]?.status === 'solved');
      solvedProbs.sort((a, b) => {
        const timeA = progress[a.id]?.lastSolvedAt || 0;
        const timeB = progress[b.id]?.lastSolvedAt || 0;
        return timeA - timeB;
      });

      let chosenProblem = null;
      let reason = '';
      
      if (revisionDueProbs.length > 0) {
        chosenProblem = revisionDueProbs[0];
        reason = `You have revision due for this problem. Reviewing it will reinforce your memory.`;
      } else if (unsolvedProbs.length > 0) {
        chosenProblem = unsolvedProbs[0];
        reason = mastery === 0 
          ? `Start mastering the "${pattern.name}" pattern. Solving this will start your learning progress.`
          : `Expand your understanding of "${pattern.name}". Solving this will strengthen your active topic.`;
      } else if (solvedProbs.length > 0) {
        chosenProblem = solvedProbs[0];
        reason = `You solved this ${Math.round(daysSinceLastPractice)} days ago. Practicing it again prevents forgetting.`;
      } else if (pattern.problems.length > 0) {
        // Fallback
        chosenProblem = pattern.problems[0];
        reason = `Solve this advanced variant to test and push your boundaries.`;
      }

      if (chosenProblem) {
        const lastPracticedText = daysSinceLastPractice >= 30 || solvedProbs.length === 0
          ? 'Never' 
          : `${Math.round(daysSinceLastPractice)} Days Ago`;
          
        return {
          pattern,
          problem: chosenProblem,
          mastery,
          lastPracticedText,
          reason,
          estTime: chosenProblem.difficulty === 'Easy' ? 15 : chosenProblem.difficulty === 'Medium' ? 20 : 35,
          difficulty: chosenProblem.difficulty
        };
      }
    }

    return null;
  },

  resetAllData: async () => {
    await resetDatabase();
    await deleteSecureApiKey().catch(() => {});
    await clearAuthTokens().catch(() => {});
    await deleteActiveEmail().catch(() => {});
    set({
      progress: {},
      isAuthenticated: false,
      accessToken: null,
      profile: {
        userId: `user_${Date.now()}`,
        userName: '',
        preferredLanguage: 'Python',
        hasCompletedOnboarding: false
      }
    });
  },

  login: async (tokens, progressList) => {
    await saveAuthTokens(tokens);
    let userName = 'User';
    let userId = `user_${Date.now()}`;
    let email = undefined;
    
    if (tokens.idToken) {
      const decoded = decodeJwtPayload(tokens.idToken);
      if (decoded) {
        userName = decoded.name || decoded.nickname || decoded.given_name || 'User';
        userId = decoded.sub || userId;
        email = decoded.email;
      }
    }

    const { profile } = get();
    const newProfile = {
      ...(profile || { preferredLanguage: 'Python', hasCompletedOnboarding: false }),
      userId,
      userName,
      hasCompletedOnboarding: true,
      email,
    };

    await saveProfile(newProfile);
    if (email) {
      await saveActiveEmail(email);
    }

    // Save restored progress to SQLite and state
    const progressMap: Record<string, UserProgress> = {};
    if (progressList && progressList.length > 0) {
      for (const item of progressList) {
        await saveProgress(item);
        progressMap[item.problemId] = item;
      }
    }

    set({
      isAuthenticated: true,
      accessToken: tokens.accessToken,
      profile: newProfile,
      progress: progressList ? progressMap : get().progress,
    });
  },

  logout: async () => {
    await clearAuthTokens().catch(() => {});
    await resetDatabase();
    await deleteSecureApiKey().catch(() => {});
    await deleteActiveEmail().catch(() => {});
    set({
      isAuthenticated: false,
      accessToken: null,
      progress: {},
      profile: {
        userId: `user_${Date.now()}`,
        userName: '',
        preferredLanguage: 'Python',
        hasCompletedOnboarding: false
      }
    });
  }
}));
