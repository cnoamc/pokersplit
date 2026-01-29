import { useState, useEffect } from 'react';
import { GameSession, Player } from '@/lib/types';
import { PlayerCard } from './PlayerCard';
import { GameSummary } from './GameSummary';
import { useFeedback } from '@/hooks/useFeedback';
import { AddPlayerModal } from '@/components/players/AddPlayerModal';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Plus, Flag, RotateCcw, ChevronRight } from 'lucide-react';
import { usePlayers } from '@/hooks/usePlayers';

interface LiveGameProps {
  game: GameSession;
  onAddPlayer: (playerId: string) => void;
  onUpdatePlayer: (playerId: string, updates: any) => void;
  onRemovePlayer: (playerId: string) => void;
  onEndGame: () => void;
  onResetGame: () => void;
}

export function LiveGame({ 
  game, 
  onAddPlayer, 
  onUpdatePlayer, 
  onRemovePlayer, 
  onEndGame, 
  onResetGame 
}: LiveGameProps) {
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const { playerAdded, gameEnded } = useFeedback();
  const { players, addPlayer, getPlayerName, checkDuplicateName, refreshPlayers } = usePlayers();

  useEffect(() => {
    refreshPlayers();
  }, [refreshPlayers]);

  const handleAddPlayer = (player: Player) => {
    onAddPlayer(player.id);
    playerAdded();
  };

  const handleCreatePlayer = async (name: string): Promise<Player> => {
    const player = await addPlayer(name);
    return player;
  };

  const handleEndGame = () => {
    gameEnded();
    onEndGame();
  };

  const canEndGame = game.players.length >= 2;
  const selectedPlayerIds = game.players.map(p => p.playerId);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{game.title}</h1>
          <p className="text-xs text-muted-foreground">
            {game.settings.mode === 'money' ? 'Money' : 'Points'} Mode • 
            {game.settings.currencySymbol}{game.settings.buyInValue} / {game.settings.chipsPerBuyIn} chips
          </p>
        </div>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <RotateCcw className="w-5 h-5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="glass-card">
            <AlertDialogHeader>
              <AlertDialogTitle>Reset Game?</AlertDialogTitle>
              <AlertDialogDescription>
                This will clear all current game data. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onResetGame} className="bg-destructive text-destructive-foreground">
                Reset
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Summary Cards */}
      <GameSummary 
        totals={game.totals} 
        settings={game.settings} 
        playerCount={game.players.length} 
      />

      {/* Players List */}
      <div className="space-y-3 stagger-children">
        {game.players.map((player) => (
          <PlayerCard
            key={player.playerId}
            player={player}
            playerName={getPlayerName(player.playerId)}
            settings={game.settings}
            totals={game.totals}
            onUpdate={(updates) => onUpdatePlayer(player.playerId, updates)}
            onRemove={() => onRemovePlayer(player.playerId)}
          />
        ))}
      </div>

      {/* Add Player Button */}
      <Button
        variant="secondary"
        onClick={() => setShowAddPlayer(true)}
        className="w-full h-12 border-dashed border-2"
      >
        <Plus className="w-5 h-5 mr-2" />
        Add Player
      </Button>

      {/* Add Player Modal */}
      <AddPlayerModal
        open={showAddPlayer}
        onClose={() => setShowAddPlayer(false)}
        players={players}
        selectedPlayerIds={selectedPlayerIds}
        onSelectPlayer={handleAddPlayer}
        onCreatePlayer={handleCreatePlayer}
        checkDuplicateName={checkDuplicateName}
      />

      {/* End Game Button */}
      <Button
        onClick={handleEndGame}
        disabled={!canEndGame}
        className="w-full h-14 text-lg font-semibold chip-button bg-primary hover:bg-primary/90"
        size="lg"
      >
        <Flag className="w-5 h-5 mr-2" />
        End Game
        <ChevronRight className="w-5 h-5 ml-2" />
      </Button>

      {!canEndGame && (
        <p className="text-center text-sm text-muted-foreground">
          Add at least 2 players to end the game
        </p>
      )}
    </div>
  );
}
