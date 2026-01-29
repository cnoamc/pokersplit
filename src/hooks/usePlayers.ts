import { useState, useEffect, useCallback } from 'react';
import { Player } from '@/lib/types';
import {
  getAllPlayers,
  addPlayer as addPlayerToDb,
  updatePlayer as updatePlayerInDb,
  archivePlayer as archivePlayerInDb,
  getPlayer,
} from '@/lib/storage';

export function usePlayers() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPlayers = useCallback(async () => {
    try {
      const data = await getAllPlayers();
      // Filter out archived players for selection, sort by lastUsedAt
      setPlayers(data.sort((a, b) => 
        new Date(b.lastUsedAt).getTime() - new Date(a.lastUsedAt).getTime()
      ));
    } catch (error) {
      console.error('Error loading players:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlayers();
  }, [loadPlayers]);

  const addPlayer = useCallback(async (displayName: string): Promise<Player> => {
    const player = await addPlayerToDb(displayName.trim());
    await loadPlayers();
    return player;
  }, [loadPlayers]);

  const updatePlayer = useCallback(async (playerId: string, displayName: string): Promise<void> => {
    await updatePlayerInDb(playerId, displayName.trim());
    await loadPlayers();
  }, [loadPlayers]);

  const archivePlayer = useCallback(async (playerId: string): Promise<void> => {
    await archivePlayerInDb(playerId);
    await loadPlayers();
  }, [loadPlayers]);

  const getPlayerName = useCallback((playerId: string): string => {
    const player = players.find(p => p.id === playerId);
    return player?.displayName || 'Unknown Player';
  }, [players]);

  const getPlayerById = useCallback(async (playerId: string): Promise<Player | undefined> => {
    return getPlayer(playerId);
  }, []);

  const checkDuplicateName = useCallback((name: string, excludeId?: string): Player | undefined => {
    const normalizedName = name.trim().toLowerCase();
    return players.find(p => 
      p.displayName.toLowerCase() === normalizedName && 
      p.id !== excludeId &&
      !p.isArchived
    );
  }, [players]);

  const activePlayers = players.filter(p => !p.isArchived);
  const archivedPlayers = players.filter(p => p.isArchived);

  return {
    players,
    activePlayers,
    archivedPlayers,
    loading,
    addPlayer,
    updatePlayer,
    archivePlayer,
    getPlayerName,
    getPlayerById,
    checkDuplicateName,
    refreshPlayers: loadPlayers,
  };
}
