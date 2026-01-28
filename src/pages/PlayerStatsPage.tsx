import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlayerStats } from '@/lib/types';
import { getPlayerStats } from '@/lib/storage';
import { formatCurrency } from '@/lib/calculations';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Trophy, 
  TrendingUp, 
  TrendingDown, 
  Target,
  Calendar,
  Gamepad2,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PlayerStatsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [player, setPlayer] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPlayer() {
      if (!id) return;
      try {
        const data = await getPlayerStats(id);
        if (data) {
          setPlayer(data);
        }
      } catch (error) {
        console.error('Error loading player:', error);
      } finally {
        setLoading(false);
      }
    }
    loadPlayer();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!player) {
    return (
      <div className="p-4 safe-bottom">
        <Button variant="ghost" onClick={() => navigate('/stats')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="text-center py-16">
          <p className="text-muted-foreground">Player not found</p>
        </div>
      </div>
    );
  }

  const lastPlayed = new Date(player.lastPlayedAt);

  return (
    <div className="p-4 safe-bottom animate-fade-in">
      {/* Header */}
      <Button variant="ghost" onClick={() => navigate('/stats')} className="mb-4 -ml-2">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      {/* Profile Header */}
      <div className="text-center mb-6">
        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
          <span className="text-3xl font-bold text-primary">
            {player.playerName.charAt(0).toUpperCase()}
          </span>
        </div>
        <h1 className="text-display-sm gradient-text">{player.playerName}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Last played: {lastPlayed.toLocaleDateString()}
        </p>
      </div>

      {/* Main Stats */}
      <div className="glass-card p-5 mb-4 text-center">
        <div className="text-sm text-muted-foreground mb-1">Total Net Profit/Loss</div>
        <div className={cn(
          'text-4xl font-bold number-display',
          player.totalNet > 0 && 'text-success',
          player.totalNet < 0 && 'text-destructive'
        )}>
          {player.totalNet > 0 && '+'}{formatCurrency(player.totalNet, '₪')}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Gamepad2 className="w-4 h-4" />
            <span className="text-xs">Games Played</span>
          </div>
          <div className="text-2xl font-bold number-display">{player.gamesPlayed}</div>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Target className="w-4 h-4" />
            <span className="text-xs">Win Rate</span>
          </div>
          <div className="text-2xl font-bold number-display">{Math.round(player.winRate)}%</div>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <TrendingUp className="w-4 h-4 text-success" />
            <span className="text-xs">Average Net</span>
          </div>
          <div className={cn(
            'text-xl font-bold number-display',
            player.averageNet > 0 && 'text-success',
            player.averageNet < 0 && 'text-destructive'
          )}>
            {player.averageNet > 0 && '+'}{formatCurrency(player.averageNet, '₪')}
          </div>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Trophy className="w-4 h-4 text-gold" />
            <span className="text-xs">Biggest Win</span>
          </div>
          <div className="text-xl font-bold text-success number-display">
            +{formatCurrency(player.biggestWin, '₪')}
          </div>
        </div>
      </div>

      {/* Biggest Loss */}
      {player.biggestLoss < 0 && (
        <div className="glass-card p-4 border-l-4 border-l-destructive">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <TrendingDown className="w-4 h-4 text-destructive" />
            <span className="text-xs">Biggest Loss</span>
          </div>
          <div className="text-xl font-bold text-destructive number-display">
            {formatCurrency(player.biggestLoss, '₪')}
          </div>
        </div>
      )}
    </div>
  );
}
