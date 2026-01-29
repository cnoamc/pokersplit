import { useState, useEffect } from 'react';
import { Player } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Search, UserPlus, AlertTriangle, Check, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddPlayerModalProps {
  open: boolean;
  onClose: () => void;
  players: Player[];
  selectedPlayerIds: string[];
  onSelectPlayer: (player: Player) => void;
  onCreatePlayer: (name: string) => Promise<Player>;
  checkDuplicateName: (name: string) => Player | undefined;
}

export function AddPlayerModal({
  open,
  onClose,
  players,
  selectedPlayerIds,
  onSelectPlayer,
  onCreatePlayer,
  checkDuplicateName,
}: AddPlayerModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateConfirm, setShowCreateConfirm] = useState(false);
  const [duplicatePlayer, setDuplicatePlayer] = useState<Player | undefined>();

  useEffect(() => {
    if (!open) {
      setSearchQuery('');
      setShowCreateConfirm(false);
      setDuplicatePlayer(undefined);
    }
  }, [open]);

  const availablePlayers = players.filter(
    p => !p.isArchived && !selectedPlayerIds.includes(p.id)
  );

  const filteredPlayers = availablePlayers.filter(p =>
    p.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setShowCreateConfirm(false);
    setDuplicatePlayer(undefined);
  };

  const handleCreateNew = () => {
    const trimmedName = searchQuery.trim();
    if (!trimmedName) return;

    const duplicate = checkDuplicateName(trimmedName);
    if (duplicate && !selectedPlayerIds.includes(duplicate.id)) {
      setDuplicatePlayer(duplicate);
      setShowCreateConfirm(true);
    } else {
      createAndSelect(trimmedName);
    }
  };

  const createAndSelect = async (name: string) => {
    const player = await onCreatePlayer(name);
    onSelectPlayer(player);
    onClose();
  };

  const handleSelectExisting = (player: Player) => {
    onSelectPlayer(player);
    onClose();
  };

  const hasExactMatch = availablePlayers.some(
    p => p.displayName.toLowerCase() === searchQuery.toLowerCase()
  );

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="glass-card max-w-md">
        <DialogHeader>
          <DialogTitle>Add Player</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search or enter new name..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 input-poker"
              autoFocus
            />
          </div>

          {/* Duplicate Warning */}
          {showCreateConfirm && duplicatePlayer && (
            <div className="glass-card p-3 border-l-4 border-l-warning bg-warning/10">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Name already exists</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    "{duplicatePlayer.displayName}" exists. Select existing or create new anyway.
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleSelectExisting(duplicatePlayer)}
                      className="flex-1"
                    >
                      Use Existing
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => createAndSelect(searchQuery.trim())}
                      className="flex-1"
                    >
                      Create New
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Player List */}
          <div className="max-h-64 overflow-y-auto space-y-2">
            {filteredPlayers.length > 0 ? (
              filteredPlayers.map((player) => (
                <button
                  key={player.id}
                  onClick={() => handleSelectExisting(player)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{player.displayName}</div>
                    <div className="text-xs text-muted-foreground">
                      Last played: {new Date(player.lastUsedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <Check className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100" />
                </button>
              ))
            ) : searchQuery && !hasExactMatch ? (
              <div className="text-center py-4 text-muted-foreground text-sm">
                No players found matching "{searchQuery}"
              </div>
            ) : !searchQuery ? (
              <div className="text-center py-4 text-muted-foreground text-sm">
                {availablePlayers.length === 0
                  ? 'No available players. Create a new one!'
                  : 'Start typing to search players'}
              </div>
            ) : null}
          </div>

          {/* Create New Button */}
          {searchQuery.trim() && !hasExactMatch && !showCreateConfirm && (
            <Button
              onClick={handleCreateNew}
              className="w-full"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Create "{searchQuery.trim()}"
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
