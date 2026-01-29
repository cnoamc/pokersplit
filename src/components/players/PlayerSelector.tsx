import { useState } from 'react';
import { Player } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AddPlayerModal } from './AddPlayerModal';
import { Search, UserPlus, X, User, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlayerSelectorProps {
  players: Player[];
  selectedPlayers: Player[];
  onTogglePlayer: (player: Player) => void;
  onCreatePlayer: (name: string) => Promise<Player>;
  checkDuplicateName: (name: string) => Player | undefined;
}

export function PlayerSelector({
  players,
  selectedPlayers,
  onTogglePlayer,
  onCreatePlayer,
  checkDuplicateName,
}: PlayerSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const activePlayers = players.filter(p => !p.isArchived);
  const selectedIds = selectedPlayers.map(p => p.id);

  const filteredPlayers = searchQuery
    ? activePlayers.filter(p =>
        p.displayName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : activePlayers;

  const handleAddFromModal = (player: Player) => {
    if (!selectedIds.includes(player.id)) {
      onTogglePlayer(player);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search players..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 input-poker"
        />
      </div>

      {/* Selected Players */}
      {selectedPlayers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedPlayers.map(player => (
            <div
              key={player.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 text-primary text-sm"
            >
              <span>{player.displayName}</span>
              <button
                onClick={() => onTogglePlayer(player)}
                className="hover:bg-primary/20 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Player List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {filteredPlayers.map(player => {
          const isSelected = selectedIds.includes(player.id);
          return (
            <button
              key={player.id}
              onClick={() => onTogglePlayer(player)}
              className={cn(
                'w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left',
                isSelected
                  ? 'bg-primary/20 border border-primary/50'
                  : 'bg-secondary/50 hover:bg-secondary'
              )}
            >
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center',
                isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
              )}>
                {isSelected ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <User className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium">{player.displayName}</div>
              </div>
            </button>
          );
        })}

        {filteredPlayers.length === 0 && (
          <div className="text-center py-6 text-muted-foreground text-sm">
            {searchQuery ? `No players found matching "${searchQuery}"` : 'No players yet'}
          </div>
        )}
      </div>

      {/* Add New Player Button */}
      <Button
        variant="secondary"
        onClick={() => setShowAddModal(true)}
        className="w-full h-12 border-dashed border-2"
      >
        <UserPlus className="w-5 h-5 mr-2" />
        Add New Player
      </Button>

      <AddPlayerModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        players={players}
        selectedPlayerIds={selectedIds}
        onSelectPlayer={handleAddFromModal}
        onCreatePlayer={onCreatePlayer}
        checkDuplicateName={checkDuplicateName}
      />
    </div>
  );
}
