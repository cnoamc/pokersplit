import { useGame } from '@/hooks/useGame';
import { GameSetup } from '@/components/game/GameSetup';
import { LiveGame } from '@/components/game/LiveGame';
import { GameResults } from '@/components/game/GameResults';
import { Loader2 } from 'lucide-react';

export default function GamePage() {
  const {
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
  } = useGame();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 safe-bottom">
      {phase === 'setup' && (
        <GameSetup onStart={startGame} currencySymbol={currencySymbol} />
      )}

      {phase === 'playing' && game && (
        <LiveGame
          game={game}
          onAddPlayer={addPlayer}
          onUpdatePlayer={updatePlayer}
          onRemovePlayer={removePlayer}
          onEndGame={endGame}
          onResetGame={resetGame}
        />
      )}

      {phase === 'results' && game && (
        <GameResults
          game={game}
          onToggleSettlement={toggleSettlement}
          onNewGame={startNewGame}
        />
      )}
    </div>
  );
}
