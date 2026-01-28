import { useState } from 'react';
import { GameSession } from '@/lib/types';
import { PlayerCard } from './PlayerCard';
import { GameSummary } from './GameSummary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

interface LiveGameProps {
  game: GameSession;
  onAddPlayer: (name: string) => void;
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
  const [newPlayerName, setNewPlayerName] = useState('');
  const [showAddPlayer, setShowAddPlayer] = useState(false);

  const handleAddPlayer = () => {
    if (newPlayerName.trim()) {
      onAddPlayer(newPlayerName.trim());
      setNewPlayerName('');
      setShowAddPlayer(false);
    }
  };

  const canEndGame = game.players.length >= 2;

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
            key={player.id}
            player={player}
            settings={game.settings}
            totals={game.totals}
            onUpdate={(updates) => onUpdatePlayer(player.id, updates)}
            onRemove={() => onRemovePlayer(player.id)}
          />
        ))}
      </div>

      {/* Add Player */}
      {showAddPlayer ? (
        <div className="glass-card p-4 animate-fade-in">
          <Input
            type="text"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            placeholder="Player name"
            className="input-poker mb-3"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
          />
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowAddPlayer(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddPlayer}
              disabled={!newPlayerName.trim()}
              className="flex-1"
            >
              Add Player
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="secondary"
          onClick={() => setShowAddPlayer(true)}
          className="w-full h-12 border-dashed border-2"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Player
        </Button>
      )}

      {/* End Game Button */}
      <Button
        onClick={onEndGame}
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
