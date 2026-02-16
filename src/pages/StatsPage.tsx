import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Player, PlayerStats } from '@/lib/types';
import { getAllPlayers, computePlayerStats, updatePlayer, archivePlayer } from '@/lib/storage';
import { formatCurrency } from '@/lib/calculations';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Trophy, 
  TrendingUp, 
  TrendingDown, 
  ChevronRight, 
  Users, 
  UserPlus,
  Search,
  Edit2,
  Archive,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePlayers } from '@/hooks/usePlayers';
import { toast } from 'sonner';

export default function StatsPage() {
  const [stats, setStats] = useState<PlayerStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [editName, setEditName] = useState('');
  const [archivingPlayer, setArchivingPlayer] = useState<Player | null>(null);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [showPlayers, setShowPlayers] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');

  const { players, activePlayers, addPlayer, refreshPlayers, checkDuplicateName } = usePlayers();

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await computePlayerStats();
        // Sort by total net (descending)
        const sorted = data.sort((a, b) => b.totalNet - a.totalNet);
        setStats(sorted);
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const handleEditPlayer = (player: Player) => {
    setEditingPlayer(player);
    setEditName(player.displayName);
  };

  const handleSaveEdit = async () => {
    if (!editingPlayer || !editName.trim()) return;
    
    await updatePlayer(editingPlayer.id, editName.trim());
    await refreshPlayers();
    
    // Refresh stats to get updated names
    const data = await computePlayerStats();
    setStats(data.sort((a, b) => b.totalNet - a.totalNet));
    
    setEditingPlayer(null);
    toast.success('Player name updated');
  };

  const handleArchivePlayer = async () => {
    if (!archivingPlayer) return;
    
    await archivePlayer(archivingPlayer.id);
    await refreshPlayers();
    setArchivingPlayer(null);
    toast.success('Player archived');
  };

  const handleAddPlayer = async () => {
    if (!newPlayerName.trim()) return;
    
    const duplicate = checkDuplicateName(newPlayerName.trim());
    if (duplicate) {
      toast.error(`A player named "${duplicate.displayName}" already exists`);
      return;
    }
    
    await addPlayer(newPlayerName.trim());
    setNewPlayerName('');
    setShowAddPlayer(false);
    toast.success('Player added');
  };

  const filteredPlayers = activePlayers.filter(p =>
    p.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-4 safe-bottom">
        <PageHeader title="Players & Stats" subtitle="Manage players & leaderboard" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass-card p-4 animate-pulse">
              <div className="h-5 bg-secondary rounded w-1/3 mb-2" />
              <div className="h-4 bg-secondary rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 safe-bottom">
      <PageHeader title="Leaderboard" subtitle="Player rankings & stats" />

      {/* Leaderboard Section */}
      <div>
        {stats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Trophy className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-1">No stats yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Complete games to see player statistics
            </p>
            <Button onClick={() => setShowPlayers(true)}>
              <UserPlus className="w-4 h-4 mr-1" />
              Manage Players
            </Button>
          </div>
        ) : (
          <div className="space-y-3 stagger-children">
            {stats.map((player, index) => (
              <Link
                key={player.playerId}
                to={`/stats/${player.playerId}`}
                className="glass-card p-4 flex items-center justify-between hover:border-primary/50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-bold',
                    index === 0 && 'bg-gold text-gold-foreground',
                    index === 1 && 'bg-[#C0C0C0] text-black',
                    index === 2 && 'bg-[#CD7F32] text-white',
                    index > 2 && 'bg-secondary text-muted-foreground'
                  )}>
                    {index < 3 ? (
                      <Trophy className="w-5 h-5" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  
                  <div>
                    <div className="font-semibold">{player.displayName}</div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{player.gamesPlayed} game{player.gamesPlayed !== 1 && 's'}</span>
                      <span>•</span>
                      <span>{Math.round(player.winRate)}% win rate</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className={cn(
                    'text-lg font-bold number-display',
                    player.totalNet > 0 && 'text-success',
                    player.totalNet < 0 && 'text-destructive'
                  )}>
                    {player.totalNet > 0 && '+'}{formatCurrency(player.totalNet, '₪')}
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Floating Manage Players Button */}
      <Button
        onClick={() => setShowPlayers(true)}
        className="fixed z-40 h-14 w-14 rounded-full shadow-lg"
        style={{ bottom: 'calc(5rem + env(safe-area-inset-bottom))', right: '1rem' }}
        size="icon"
      >
        <Users className="w-6 h-6" />
      </Button>

      {/* Players Management Dialog */}
      <Dialog open={showPlayers} onOpenChange={setShowPlayers}>
        <DialogContent className="glass-card max-h-[70vh] flex flex-col w-[85vw] max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Manage Players
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 py-2">
            {/* Search + Add */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search players..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 input-poker"
                />
              </div>
              <Button size="icon" onClick={() => setShowAddPlayer(true)}>
                <UserPlus className="w-4 h-4" />
              </Button>
            </div>

            {/* Player List */}
            <div className="space-y-2">
              {filteredPlayers.length > 0 ? (
                filteredPlayers.map(player => (
                  <div
                    key={player.id}
                    className="glass-card p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{player.displayName}</div>
                        <div className="text-xs text-muted-foreground">
                          Added {new Date(player.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditPlayer(player)}
                        className="h-8 w-8"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setArchivingPlayer(player)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Archive className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  {searchQuery ? `No players matching "${searchQuery}"` : 'No players yet. Add one to get started!'}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Player Dialog */}
      <Dialog open={!!editingPlayer} onOpenChange={() => setEditingPlayer(null)}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle>Edit Player</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Player name"
              className="input-poker"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setEditingPlayer(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={!editName.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Player Dialog */}
      <Dialog open={showAddPlayer} onOpenChange={setShowAddPlayer}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle>Add New Player</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              placeholder="Player name"
              className="input-poker"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
            />
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowAddPlayer(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPlayer} disabled={!newPlayerName.trim()}>
              Add Player
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Archive Confirmation */}
      <AlertDialog open={!!archivingPlayer} onOpenChange={() => setArchivingPlayer(null)}>
        <AlertDialogContent className="glass-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Player?</AlertDialogTitle>
            <AlertDialogDescription>
              "{archivingPlayer?.displayName}" will be hidden from player selection but their history will be preserved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchivePlayer}>
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
