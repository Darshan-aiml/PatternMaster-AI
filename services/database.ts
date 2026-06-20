import * as SQLite from 'expo-sqlite';
import { encryptData, decryptData } from './encryption';

let db: SQLite.SQLiteDatabase;

// In-memory cache for frequently accessed data
const cache = {
  profile: null as any,
  progress: null as any,
  lastProfileUpdate: 0,
  lastProgressUpdate: 0,
  CACHE_TTL: 5 * 60 * 1000 // 5 minutes
};

// Migration: Add missing columns to existing tables
const migrateDatabase = async () => {
  try {
    const profileInfo = await db.getAllAsync('PRAGMA table_info(profile)');
    const profileColumns = profileInfo.map((c: any) => c.name);
    
    if (!profileColumns.includes('createdAt')) {
      await db.runAsync(`ALTER TABLE profile ADD COLUMN createdAt INTEGER DEFAULT 0`);
      console.log('Added createdAt to profile table');
    }
    
    if (!profileColumns.includes('updatedAt')) {
      await db.runAsync(`ALTER TABLE profile ADD COLUMN updatedAt INTEGER DEFAULT 0`);
      console.log('Added updatedAt to profile table');
    }

    if (!profileColumns.includes('geminiApiKey')) {
      await db.runAsync(`ALTER TABLE profile ADD COLUMN geminiApiKey TEXT`);
      console.log('Added geminiApiKey to profile table');
    }

    const progressInfo = await db.getAllAsync('PRAGMA table_info(progress)');
    const progressColumns = progressInfo.map((c: any) => c.name);
    
    if (!progressColumns.includes('createdAt')) {
      await db.runAsync(`ALTER TABLE progress ADD COLUMN createdAt INTEGER DEFAULT 0`);
      console.log('Added createdAt to progress table');
    }
    
    if (!progressColumns.includes('updatedAt')) {
      await db.runAsync(`ALTER TABLE progress ADD COLUMN updatedAt INTEGER DEFAULT 0`);
      console.log('Added updatedAt to progress table');
    }
  } catch (error) {
    console.error('Migration error:', error);
  }
};

export const initDB = async () => {
  try {
    const initPromise = (async () => {
      db = await SQLite.openDatabaseAsync('patternmaster.db');
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        PRAGMA synchronous = NORMAL;
        PRAGMA cache_size = 2000;
        
        CREATE TABLE IF NOT EXISTS profile (
          userId TEXT PRIMARY KEY NOT NULL,
          userName TEXT,
          preferredLanguage TEXT,
          hasCompletedOnboarding INTEGER DEFAULT 0,
          geminiApiKey TEXT,
          createdAt INTEGER DEFAULT 0,
          updatedAt INTEGER DEFAULT 0
        );
        
        CREATE TABLE IF NOT EXISTS progress (
          problemId TEXT PRIMARY KEY NOT NULL,
          status TEXT NOT NULL,
          attemptCount INTEGER DEFAULT 0,
          lastSolvedAt INTEGER DEFAULT 0,
          revisionCount INTEGER DEFAULT 0,
          masteryLevel INTEGER DEFAULT 0,
          createdAt INTEGER DEFAULT 0,
          updatedAt INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS ai_explanations (
          problemId TEXT PRIMARY KEY NOT NULL,
          explanation TEXT NOT NULL,
          createdAt INTEGER DEFAULT 0,
          updatedAt INTEGER DEFAULT 0
        );
        
        CREATE INDEX IF NOT EXISTS idx_progress_status ON progress(status);
        CREATE INDEX IF NOT EXISTS idx_progress_mastery ON progress(masteryLevel DESC);
        CREATE INDEX IF NOT EXISTS idx_progress_created ON progress(createdAt DESC);
        CREATE INDEX IF NOT EXISTS idx_profile_updated ON profile(updatedAt DESC);
        CREATE INDEX IF NOT EXISTS idx_progress_updated ON progress(updatedAt DESC);
        CREATE INDEX IF NOT EXISTS idx_progress_status_mastery ON progress(status, masteryLevel DESC);
        CREATE INDEX IF NOT EXISTS idx_ai_explanations_updated ON ai_explanations(updatedAt DESC);
      `);
      
      // Run migrations for existing databases
      await migrateDatabase();
    })();

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database initialization timed out')), 5000)
    );

    await Promise.race([initPromise, timeoutPromise]);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error; // Rethrow to let the UI know it failed
  }
};

export const saveProfile = async (profile: any) => {
  try {
    const encryptedName = await encryptData(profile.userName || '');
    const now = Date.now();
    await db.runAsync(
      `INSERT OR REPLACE INTO profile 
       (userId, userName, preferredLanguage, hasCompletedOnboarding, geminiApiKey, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, COALESCE((SELECT createdAt FROM profile WHERE userId = ?), ?), ?)`,
      [
        profile.userId,
        encryptedName,
        profile.preferredLanguage,
        profile.hasCompletedOnboarding ? 1 : 0,
        null, // Omit api key from SQLite for security
        profile.userId,
        now,
        now
      ]
    );
    
    // Invalidate cache
    cache.profile = null;
    cache.lastProfileUpdate = 0;
  } catch (error) {
    console.error('Error saving profile:', error);
  }
};

export const getProfile = async () => {
  try {
    // Check cache first
    const now = Date.now();
    if (cache.profile && (now - cache.lastProfileUpdate) < cache.CACHE_TTL) {
      return cache.profile;
    }

    const result = await db.getFirstAsync('SELECT * FROM profile LIMIT 1');

    if (result) {
      const resultObj = result as any;
      const decryptedName = await decryptData(resultObj.userName || '');
      const profile = {
        ...resultObj,
        userName: decryptedName,
        hasCompletedOnboarding: resultObj.hasCompletedOnboarding === 1
      };
      
      // Update cache
      cache.profile = profile;
      cache.lastProfileUpdate = now;
      
      return profile;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting profile:', error);
    return null;
  }
};

export const saveProgress = async (progress: any) => {
  try {
    const now = Date.now();
    await db.runAsync(
      `INSERT OR REPLACE INTO progress 
       (problemId, status, attemptCount, lastSolvedAt, revisionCount, masteryLevel, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, COALESCE((SELECT createdAt FROM progress WHERE problemId = ?), ?), ?)`,
      [
        progress.problemId,
        progress.status,
        progress.attemptCount,
        progress.lastSolvedAt,
        progress.revisionCount,
        progress.masteryLevel,
        progress.problemId,
        progress.createdAt || now,
        now
      ]
    );
    
    // Invalidate cache
    cache.progress = null;
    cache.lastProgressUpdate = 0;
  } catch (error) {
    console.error('Error saving progress:', error);
  }
};

export const getProgress = async () => {
  try {
    // Check cache first
    const now = Date.now();
    if (cache.progress && (now - cache.lastProgressUpdate) < cache.CACHE_TTL) {
      return cache.progress;
    }

    const results = await db.getAllAsync(
      'SELECT * FROM progress ORDER BY updatedAt DESC'
    );
    
    if (results) {
      // Update cache
      cache.progress = results;
      cache.lastProgressUpdate = now;
      
      return results;
    }
    
    return [];
  } catch (error) {
    console.error('Error getting progress:', error);
    return [];
  }
};

// Get progress by status for filtering
export const getProgressByStatus = async (status: string) => {
  try {
    const results = await db.getAllAsync(
      'SELECT * FROM progress WHERE status = ? ORDER BY masteryLevel DESC',
      [status]
    );
    return results || [];
  } catch (error) {
    console.error('Error getting progress by status:', error);
    return [];
  }
};

// Get progress sorted by mastery level
export const getProgressByMastery = async () => {
  try {
    const results = await db.getAllAsync(
      'SELECT * FROM progress WHERE masteryLevel > 0 ORDER BY masteryLevel ASC'
    );
    return results || [];
  } catch (error) {
    console.error('Error getting progress by mastery:', error);
    return [];
  }
};

// Get specific problem progress
export const getProblemProgress = async (problemId: string) => {
  try {
    const result = await db.getFirstAsync(
      'SELECT * FROM progress WHERE problemId = ?',
      [problemId]
    );
    return result || null;
  } catch (error) {
    console.error('Error getting problem progress:', error);
    return null;
  }
};

// Batch update progress (for syncing)
export const batchUpdateProgress = async (progressList: any[]) => {
  try {
    for (const progress of progressList) {
      await saveProgress(progress);
    }
  } catch (error) {
    console.error('Error batch updating progress:', error);
  }
};

// Clear old data (optional maintenance)
export const clearOldProgress = async (daysOld: number = 90) => {
  try {
    const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
    await db.runAsync(
      'DELETE FROM progress WHERE status = ? AND updatedAt < ?',
      ['unsolved', cutoffTime]
    );
    
    // Invalidate cache
    cache.progress = null;
    cache.lastProgressUpdate = 0;
  } catch (error) {
    console.error('Error clearing old progress:', error);
  }
};

// Get database stats
export const getDatabaseStats = async () => {
  try {
    const progressCount = await db.getFirstAsync(
      'SELECT COUNT(*) as count FROM progress'
    );
    const solvedCount = await db.getFirstAsync(
      'SELECT COUNT(*) as count FROM progress WHERE status = ?',
      ['solved']
    );
    
    return {
      totalProblems: (progressCount as any).count,
      solvedProblems: (solvedCount as any).count
    };
  } catch (error) {
    console.error('Error getting database stats:', error);
    return { totalProblems: 0, solvedProblems: 0 };
  }
};

// Reset database by deleting all rows in profile, progress, and ai_explanations tables
export const resetDatabase = async () => {
  try {
    await db.runAsync('DELETE FROM progress');
    await db.runAsync('DELETE FROM profile');
    await db.runAsync('DELETE FROM ai_explanations');
    // Clear caches
    cache.profile = null;
    cache.progress = null;
    cache.lastProfileUpdate = 0;
    cache.lastProgressUpdate = 0;
    console.log('Database tables cleared successfully');
  } catch (error) {
    console.error('Error resetting database:', error);
  }
};

export const saveAIExplanation = async (problemId: string, explanation: string) => {
  try {
    const encryptedExplanation = await encryptData(explanation);
    const now = Date.now();
    await db.runAsync(
      `INSERT OR REPLACE INTO ai_explanations 
       (problemId, explanation, createdAt, updatedAt) 
       VALUES (?, ?, COALESCE((SELECT createdAt FROM ai_explanations WHERE problemId = ?), ?), ?)`,
      [problemId, encryptedExplanation, problemId, now, now]
    );
  } catch (error) {
    console.error('Error saving AI explanation:', error);
  }
};

export const getAIExplanation = async (problemId: string) => {
  try {
    const result = await db.getFirstAsync(
      'SELECT explanation FROM ai_explanations WHERE problemId = ?',
      [problemId]
    );
    if (!result) return null;
    const encryptedExplanation = (result as any).explanation;
    return await decryptData(encryptedExplanation);
  } catch (error) {
    console.error('Error getting AI explanation:', error);
    return null;
  }
};

export const deleteAIExplanation = async (problemId: string) => {
  try {
    await db.runAsync('DELETE FROM ai_explanations WHERE problemId = ?', [problemId]);
  } catch (error) {
    console.error('Error deleting AI explanation:', error);
  }
};
