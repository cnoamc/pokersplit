import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlayerStats } from '@/lib/types';
import { getAllPlayerStats } from '@/lib/storage';
import { formatCurrency } from '@/lib/calculations';
import { PageHeader } from '@/components/layout/PageHeader';
import { Trophy, TrendingUp, TrendingDown, Award, Target, ChevronRight, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StatsPage() {
  const [stats, setStats] = useState<PlayerStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getAllPlayerStats();
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

  if (loading) {
    return (
      <div className="p-4 safe-bottom">
        <PageHeader title="Stats" subtitle="Player leaderboard" />
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
      <PageHeader title="Stats" subtitle="Player leaderboard" />

      {stats.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold mb-1">No stats yet</h3>
          <p className="text-sm text-muted-foreground">
            Complete games to see player statistics
          </p>
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
                  <div className="font-semibold">{player.playerName}</div>
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
  );
}
