import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { GameSession, PlayerStats, AppSettings, defaultAppSettings } from './types';

interface PokerSplitDB extends DBSchema {
  sessions: {
    key: string;
    value: GameSession;
    indexes: { 'by-date': string };
  };
  playerStats: {
    key: string;
    value: PlayerStats;
  };
  settings: {
    key: string;
    value: AppSettings;
  };
  activeGame: {
    key: string;
    value: GameSession | null;
  };
}

const DB_NAME = 'pokersplit-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<PokerSplitDB>> | null = null;

async function getDB(): Promise<IDBPDatabase<PokerSplitDB>> {
  if (!dbPromise) {
    dbPromise = openDB<PokerSplitDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Sessions store
        if (!db.objectStoreNames.contains('sessions')) {
          const sessionStore = db.createObjectStore('sessions', { keyPath: 'id' });
          sessionStore.createIndex('by-date', 'createdAt');
        }
        
        // Player stats store
        if (!db.objectStoreNames.contains('playerStats')) {
          db.createObjectStore('playerStats', { keyPath: 'playerId' });
        }
        
        // Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings');
        }
        
        // Active game store
        if (!db.objectStoreNames.contains('activeGame')) {
          db.createObjectStore('activeGame');
        }
      },
    });
  }
  return dbPromise;
}

// Active Game
export async function getActiveGame(): Promise<GameSession | null> {
  const db = await getDB();
  return (await db.get('activeGame', 'current')) || null;
}

export async function saveActiveGame(game: GameSession | null): Promise<void> {
  const db = await getDB();
  await db.put('activeGame', game, 'current');
}

export async function clearActiveGame(): Promise<void> {
  const db = await getDB();
  await db.delete('activeGame', 'current');
}

// Sessions
export async function saveSession(session: GameSession): Promise<void> {
  const db = await getDB();
  await db.put('sessions', session);
}

export async function getSession(id: string): Promise<GameSession | undefined> {
  const db = await getDB();
  return db.get('sessions', id);
}

export async function getAllSessions(): Promise<GameSession[]> {
  const db = await getDB();
  const sessions = await db.getAllFromIndex('sessions', 'by-date');
  return sessions.reverse(); // Most recent first
}

export async function deleteSession(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('sessions', id);
}

// Player Stats
export async function getPlayerStats(playerId: string): Promise<PlayerStats | undefined> {
  const db = await getDB();
  return db.get('playerStats', playerId);
}

export async function getAllPlayerStats(): Promise<PlayerStats[]> {
  const db = await getDB();
  return db.getAll('playerStats');
}

export async function savePlayerStats(stats: PlayerStats): Promise<void> {
  const db = await getDB();
  await db.put('playerStats', stats);
}

export async function updatePlayerStatsFromGame(session: GameSession): Promise<void> {
  const db = await getDB();
  
  for (const result of session.results) {
    const existingStats = await db.get('playerStats', result.playerId);
    
    if (existingStats) {
      const newGamesPlayed = existingStats.gamesPlayed + 1;
      const newTotalNet = existingStats.totalNet + result.netAmount;
      const isWin = result.netAmount > 0;
      const wins = existingStats.winRate * existingStats.gamesPlayed / 100 + (isWin ? 1 : 0);
      
      const updatedStats: PlayerStats = {
        ...existingStats,
        gamesPlayed: newGamesPlayed,
        totalNet: newTotalNet,
        averageNet: newTotalNet / newGamesPlayed,
        biggestWin: Math.max(existingStats.biggestWin, result.netAmount),
        biggestLoss: Math.min(existingStats.biggestLoss, result.netAmount),
        winRate: (wins / newGamesPlayed) * 100,
        lastPlayedAt: session.finishedAt || session.createdAt,
      };
      
      await db.put('playerStats', updatedStats);
    } else {
      const newStats: PlayerStats = {
        playerId: result.playerId,
        playerName: result.playerName,
        gamesPlayed: 1,
        totalNet: result.netAmount,
        averageNet: result.netAmount,
        biggestWin: result.netAmount > 0 ? result.netAmount : 0,
        biggestLoss: result.netAmount < 0 ? result.netAmount : 0,
        winRate: result.netAmount > 0 ? 100 : 0,
        lastPlayedAt: session.finishedAt || session.createdAt,
      };
      
      await db.put('playerStats', newStats);
    }
  }
}

// Settings
export async function getAppSettings(): Promise<AppSettings> {
  const db = await getDB();
  const settings = await db.get('settings', 'app');
  return settings || defaultAppSettings;
}

export async function saveAppSettings(settings: AppSettings): Promise<void> {
  const db = await getDB();
  await db.put('settings', settings, 'app');
}

// Reset all data
export async function resetAllData(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['sessions', 'playerStats', 'activeGame'], 'readwrite');
  await tx.objectStore('sessions').clear();
  await tx.objectStore('playerStats').clear();
  await tx.objectStore('activeGame').clear();
  await tx.done;
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
