import { useState, useEffect, useCallback } from 'react';
import { GameSession, PlayerInGame, GameSettings, GameMode } from '@/lib/types';
import { 
  getActiveGame, 
  saveActiveGame, 
  clearActiveGame, 
  saveSession, 
  generateId,
  updatePlayerStatsFromGame,
  getAppSettings
} from '@/lib/storage';
import { 
  calculateTotals, 
  calculateAllResults, 
  calculateSettlements 
} from '@/lib/calculations';

export type GamePhase = 'setup' | 'playing' | 'results';

export function useGame() {
  const [game, setGame] = useState<GameSession | null>(null);
  const [phase, setPhase] = useState<GamePhase>('setup');
  const [loading, setLoading] = useState(true);
  const [currencySymbol, setCurrencySymbol] = useState('₪');

  // Load active game on mount
  useEffect(() => {
    async function loadGame() {
      try {
        const settings = await getAppSettings();
        setCurrencySymbol(settings.currencySymbol);
        
        const activeGame = await getActiveGame();
        if (activeGame) {
          setGame(activeGame);
          setPhase(activeGame.status === 'finished' ? 'results' : 'playing');
        }
      } catch (error) {
        console.error('Error loading game:', error);
      } finally {
        setLoading(false);
      }
    }
    loadGame();
  }, []);

  // Save game whenever it changes
  useEffect(() => {
    if (game && !loading) {
      saveActiveGame(game);
    }
  }, [game, loading]);

  const startGame = useCallback(async (
    mode: GameMode,
    buyInValue: number,
    chipsPerBuyIn: number,
    title?: string
  ) => {
    const settings = await getAppSettings();
    const now = new Date();
    const defaultTitle = now.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });

    const gameSettings: GameSettings = {
      mode,
      buyInValue,
      chipsPerBuyIn,
      currencySymbol: settings.currencySymbol,
      createdAt: now.toISOString(),
    };

    const newGame: GameSession = {
      id: generateId(),
      title: title || defaultTitle,
      settings: gameSettings,
      players: [],
      results: [],
      settlements: [],
      totals: { totalBuyIns: 0, totalMoney: 0, totalChips: 0, expectedChips: 0 },
      createdAt: now.toISOString(),
      status: 'active',
    };

    setGame(newGame);
    setPhase('playing');
    await saveActiveGame(newGame);
  }, []);

  const addPlayer = useCallback((name: string) => {
    if (!game) return;

    const newPlayer: PlayerInGame = {
      id: generateId(),
      name: name.trim(),
      buyIns: 1,
      currentChips: game.settings.chipsPerBuyIn,
    };

    const updatedPlayers = [...game.players, newPlayer];
    const totals = calculateTotals(updatedPlayers, game.settings);

    setGame({
      ...game,
      players: updatedPlayers,
      totals,
    });
  }, [game]);

  const updatePlayer = useCallback((playerId: string, updates: Partial<PlayerInGame>) => {
    if (!game) return;

    const updatedPlayers = game.players.map(p =>
      p.id === playerId ? { ...p, ...updates } : p
    );
    const totals = calculateTotals(updatedPlayers, game.settings);

    setGame({
      ...game,
      players: updatedPlayers,
      totals,
    });
  }, [game]);

  const removePlayer = useCallback((playerId: string) => {
    if (!game) return;

    const updatedPlayers = game.players.filter(p => p.id !== playerId);
    const totals = calculateTotals(updatedPlayers, game.settings);

    setGame({
      ...game,
      players: updatedPlayers,
      totals,
    });
  }, [game]);

  const endGame = useCallback(async () => {
    if (!game) return;

    const results = calculateAllResults(game);
    const settlements = calculateSettlements(results);
    const now = new Date().toISOString();

    const finishedGame: GameSession = {
      ...game,
      results,
      settlements,
      finishedAt: now,
      status: 'finished',
    };

    setGame(finishedGame);
    setPhase('results');
    
    // Save to history
    await saveSession(finishedGame);
    await updatePlayerStatsFromGame(finishedGame);
  }, [game]);

  const toggleSettlement = useCallback((settlementId: string) => {
    if (!game) return;

    const updatedSettlements = game.settlements.map(s =>
      s.id === settlementId
        ? { ...s, settled: !s.settled, settledAt: !s.settled ? new Date().toISOString() : undefined }
        : s
    );

    const updatedGame = {
      ...game,
      settlements: updatedSettlements,
    };

    setGame(updatedGame);
    saveSession(updatedGame);
  }, [game]);

  const resetGame = useCallback(async () => {
    await clearActiveGame();
    setGame(null);
    setPhase('setup');
  }, []);

  const startNewGame = useCallback(async () => {
    await clearActiveGame();
    setGame(null);
    setPhase('setup');
  }, []);

  return {
    game,
    phase,
    loading,
    currencySymbol,
    startGame,
    addPlayer,
    updatePlayer,
    removePlayer,
    endGame,
    toggleSettlement,
    resetGame,
    startNewGame,
  };
}
