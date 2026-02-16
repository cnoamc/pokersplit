import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { GameSession, PlayerStats, AppSettings, defaultAppSettings, Player, AppOwner } from './types';

interface PokerSplitDB extends DBSchema {
  sessions: {
    key: string;
    value: GameSession;
    indexes: { 'by-date': string };
  };
  players: {
    key: string;
    value: Player;
    indexes: { 'by-name': string };
  };
  settings: {
    key: string;
    value: AppSettings;
  };
  activeGame: {
    key: string;
    value: GameSession | null;
  };
  migrations: {
    key: string;
    value: boolean;
  };
}

const DB_NAME = 'pokersplit-db';
const DB_VERSION = 2;

let dbPromise: Promise<IDBPDatabase<PokerSplitDB>> | null = null;

async function getDB(): Promise<IDBPDatabase<PokerSplitDB>> {
  if (!dbPromise) {
    dbPromise = openDB<PokerSplitDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion) {
        // Sessions store
        if (!db.objectStoreNames.contains('sessions')) {
          const sessionStore = db.createObjectStore('sessions', { keyPath: 'id' });
          sessionStore.createIndex('by-date', 'createdAt');
        }
        
        // Players store (new)
        if (!db.objectStoreNames.contains('players')) {
          const playersStore = db.createObjectStore('players', { keyPath: 'id' });
          playersStore.createIndex('by-name', 'displayName');
        }
        
        // Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings');
        }
        
        // Active game store
        if (!db.objectStoreNames.contains('activeGame')) {
          db.createObjectStore('activeGame');
        }

        // Migrations store
        if (!db.objectStoreNames.contains('migrations')) {
          db.createObjectStore('migrations');
        }

        // Remove old playerStats store if exists (we now compute stats dynamically)
        // Using type assertion for legacy store name not in current schema
        if (db.objectStoreNames.contains('playerStats' as any)) {
          db.deleteObjectStore('playerStats' as any);
        }
      },
    });
  }
  return dbPromise;
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ============== PLAYERS ==============

export async function getAllPlayers(): Promise<Player[]> {
  const db = await getDB();
  return db.getAll('players');
}

export async function getPlayer(id: string): Promise<Player | undefined> {
  const db = await getDB();
  return db.get('players', id);
}

export async function addPlayer(displayName: string): Promise<Player> {
  const db = await getDB();
  const now = new Date().toISOString();
  const player: Player = {
    id: generateId(),
    displayName: displayName.trim(),
    createdAt: now,
    lastUsedAt: now,
    isArchived: false,
  };
  await db.put('players', player);
  return player;
}

export async function updatePlayer(id: string, displayName: string): Promise<void> {
  const db = await getDB();
  const player = await db.get('players', id);
  if (player) {
    player.displayName = displayName.trim();
    await db.put('players', player);
  }
}

export async function archivePlayer(id: string): Promise<void> {
  const db = await getDB();
  const player = await db.get('players', id);
  if (player) {
    player.isArchived = true;
    await db.put('players', player);
  }
}

export async function updatePlayerLastUsed(ids: string[]): Promise<void> {
  const db = await getDB();
  const now = new Date().toISOString();
  for (const id of ids) {
    const player = await db.get('players', id);
    if (player) {
      player.lastUsedAt = now;
      await db.put('players', player);
    }
  }
}

// ============== ACTIVE GAME ==============

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

// ============== SESSIONS ==============

export async function saveSession(session: GameSession): Promise<void> {
  const db = await getDB();
  await db.put('sessions', session);
  
  // Update lastUsedAt for all players in this session
  const playerIds = session.players.map(p => p.playerId);
  await updatePlayerLastUsed(playerIds);
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

// ============== PLAYER STATS (Computed) ==============

export async function computePlayerStats(): Promise<PlayerStats[]> {
  const db = await getDB();
  const sessions = await db.getAll('sessions');
  const players = await db.getAll('players');
  
  // Build a map of player stats
  const statsMap = new Map<string, {
    playerId: string;
    displayName: string;
    gamesPlayed: number;
    totalNet: number;
    wins: number;
    biggestWin: number;
    biggestLoss: number;
    lastPlayedAt: string;
  }>();
  
  // Initialize from players
  for (const player of players) {
    statsMap.set(player.id, {
      playerId: player.id,
      displayName: player.displayName,
      gamesPlayed: 0,
      totalNet: 0,
      wins: 0,
      biggestWin: 0,
      biggestLoss: 0,
      lastPlayedAt: player.createdAt,
    });
  }
  
  // Aggregate from finished sessions
  for (const session of sessions) {
    if (session.status !== 'finished') continue;
    
    for (const result of session.results) {
      let stat = statsMap.get(result.playerId);
      
      // Handle case where player might have been deleted
      if (!stat) {
        const player = players.find(p => p.id === result.playerId);
        stat = {
          playerId: result.playerId,
          displayName: player?.displayName || 'Unknown Player',
          gamesPlayed: 0,
          totalNet: 0,
          wins: 0,
          biggestWin: 0,
          biggestLoss: 0,
          lastPlayedAt: session.finishedAt || session.createdAt,
        };
        statsMap.set(result.playerId, stat);
      }
      
      stat.gamesPlayed += 1;
      stat.totalNet += result.netAmount;
      if (result.netAmount > 0) stat.wins += 1;
      stat.biggestWin = Math.max(stat.biggestWin, result.netAmount);
      stat.biggestLoss = Math.min(stat.biggestLoss, result.netAmount);
      
      const sessionDate = session.finishedAt || session.createdAt;
      if (new Date(sessionDate) > new Date(stat.lastPlayedAt)) {
        stat.lastPlayedAt = sessionDate;
      }
    }
  }
  
  // Convert to PlayerStats array
  const allStats: PlayerStats[] = [];
  for (const stat of statsMap.values()) {
    if (stat.gamesPlayed === 0) continue; // Skip players with no games
    
    allStats.push({
      playerId: stat.playerId,
      displayName: stat.displayName,
      gamesPlayed: stat.gamesPlayed,
      totalNet: stat.totalNet,
      averageNet: stat.totalNet / stat.gamesPlayed,
      biggestWin: stat.biggestWin,
      biggestLoss: stat.biggestLoss,
      winRate: (stat.wins / stat.gamesPlayed) * 100,
      lastPlayedAt: stat.lastPlayedAt,
    });
  }
  
  return allStats;
}

export async function getPlayerStatsById(playerId: string): Promise<PlayerStats | undefined> {
  const allStats = await computePlayerStats();
  return allStats.find(s => s.playerId === playerId);
}

// ============== APP OWNER ==============

export async function getAppOwner(): Promise<AppOwner | null> {
  const db = await getDB();
  const owner = await db.get('settings', 'owner');
  return (owner as unknown as AppOwner) || null;
}

export async function saveAppOwner(owner: AppOwner): Promise<void> {
  const db = await getDB();
  await db.put('settings', owner as any, 'owner');
}

// ============== SETTINGS ==============

export async function getAppSettings(): Promise<AppSettings> {
  const db = await getDB();
  const settings = await db.get('settings', 'app');
  return settings || defaultAppSettings;
}

export async function saveAppSettings(settings: AppSettings): Promise<void> {
  const db = await getDB();
  await db.put('settings', settings, 'app');
}

// ============== DATA RESET ==============

export async function resetAllData(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['sessions', 'players', 'activeGame', 'migrations'], 'readwrite');
  await tx.objectStore('sessions').clear();
  await tx.objectStore('players').clear();
  await tx.objectStore('activeGame').clear();
  await tx.objectStore('migrations').clear();
  await tx.done;
}

// ============== DATA MIGRATION ==============

export async function runMigrations(): Promise<void> {
  const db = await getDB();
  
  // Check if migration has been run
  const migrationDone = await db.get('migrations', 'v2-player-ids');
  if (migrationDone) return;
  
  console.log('Running v2 migration: Converting playerName to playerId...');
  
  const sessions = await db.getAll('sessions');
  const playerNameToId = new Map<string, string>();
  
  // First pass: collect all unique player names and create Player records
  for (const session of sessions) {
    // Handle old format with 'name' field
    for (const player of session.players as any[]) {
      const name = player.name || player.displayName;
      if (name && !playerNameToId.has(name.toLowerCase())) {
        const newPlayer = await addPlayer(name);
        playerNameToId.set(name.toLowerCase(), newPlayer.id);
      }
    }
    
    // Handle results with playerName
    for (const result of session.results as any[]) {
      const name = result.playerName;
      if (name && !playerNameToId.has(name.toLowerCase())) {
        const newPlayer = await addPlayer(name);
        playerNameToId.set(name.toLowerCase(), newPlayer.id);
      }
    }
    
    // Handle settlements with fromPlayer/toPlayer names
    for (const settlement of session.settlements as any[]) {
      const fromName = settlement.fromPlayer;
      const toName = settlement.toPlayer;
      
      if (fromName && !playerNameToId.has(fromName.toLowerCase())) {
        const newPlayer = await addPlayer(fromName);
        playerNameToId.set(fromName.toLowerCase(), newPlayer.id);
      }
      if (toName && !playerNameToId.has(toName.toLowerCase())) {
        const newPlayer = await addPlayer(toName);
        playerNameToId.set(toName.toLowerCase(), newPlayer.id);
      }
    }
  }
  
  // Second pass: update sessions with playerIds
  for (const session of sessions) {
    let updated = false;
    
    // Update players
    session.players = session.players.map((player: any) => {
      if (player.name && !player.playerId) {
        updated = true;
        const playerId = playerNameToId.get(player.name.toLowerCase()) || player.id;
        return {
          playerId,
          buyIns: player.buyIns,
          currentChips: player.currentChips,
        };
      }
      return player;
    });
    
    // Update results
    session.results = session.results.map((result: any) => {
      if (result.playerName && !result.playerId) {
        updated = true;
        const playerId = playerNameToId.get(result.playerName.toLowerCase()) || generateId();
        return {
          playerId,
          buyIns: result.buyIns,
          chips: result.chips,
          invested: result.invested,
          cashOut: result.cashOut,
          netAmount: result.netAmount,
        };
      }
      return result;
    });
    
    // Update settlements
    session.settlements = session.settlements.map((settlement: any) => {
      if (settlement.fromPlayer && !settlement.fromPlayerId) {
        updated = true;
        return {
          id: settlement.id,
          fromPlayerId: playerNameToId.get(settlement.fromPlayer.toLowerCase()) || generateId(),
          toPlayerId: playerNameToId.get(settlement.toPlayer.toLowerCase()) || generateId(),
          amount: settlement.amount,
          settled: settlement.settled,
          settledAt: settlement.settledAt,
        };
      }
      return settlement;
    });
    
    if (updated) {
      await db.put('sessions', session);
    }
  }
  
  // Also migrate active game if exists
  const activeGame = await db.get('activeGame', 'current');
  if (activeGame) {
    let updated = false;
    
    activeGame.players = activeGame.players.map((player: any) => {
      if (player.name && !player.playerId) {
        updated = true;
        let playerId = playerNameToId.get(player.name.toLowerCase());
        if (!playerId) {
          // Create player if not found
          playerId = generateId();
          // We'll need to add this player
        }
        return {
          playerId,
          buyIns: player.buyIns,
          currentChips: player.currentChips,
        };
      }
      return player;
    });
    
    if (updated) {
      await db.put('activeGame', activeGame, 'current');
    }
  }
  
  // Mark migration as done
  await db.put('migrations', true, 'v2-player-ids');
  console.log('Migration complete!');
}

// Helper to get player names map for rendering
export async function getPlayerNamesMap(): Promise<Map<string, string>> {
  const players = await getAllPlayers();
  const map = new Map<string, string>();
  for (const player of players) {
    map.set(player.id, player.displayName);
  }
  return map;
}
