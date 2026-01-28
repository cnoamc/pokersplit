import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GameSession } from '@/lib/types';
import { getAllSessions } from '@/lib/storage';
import { formatCurrency } from '@/lib/calculations';
import { PageHeader } from '@/components/layout/PageHeader';
import { Calendar, Users, Trophy, ChevronRight, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function HistoryPage() {
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSessions() {
      try {
        const data = await getAllSessions();
        setSessions(data.filter(s => s.status === 'finished'));
      } catch (error) {
        console.error('Error loading sessions:', error);
      } finally {
        setLoading(false);
      }
    }
    loadSessions();
  }, []);

  const getBiggestWinner = (session: GameSession) => {
    if (!session.results.length) return null;
    const sorted = [...session.results].sort((a, b) => b.netAmount - a.netAmount);
    return sorted[0];
  };

  if (loading) {
    return (
      <div className="p-4 safe-bottom">
        <PageHeader title="History" subtitle="Your past games" />
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
      <PageHeader title="History" subtitle="Your past games" />

      {sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
            <Inbox className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold mb-1">No games yet</h3>
          <p className="text-sm text-muted-foreground">
            Complete your first game to see it here
          </p>
        </div>
      ) : (
        <div className="space-y-3 stagger-children">
          {sessions.map((session) => {
            const winner = getBiggestWinner(session);
            const date = new Date(session.createdAt);

            return (
              <Link
                key={session.id}
                to={`/history/${session.id}`}
                className="glass-card p-4 flex items-center justify-between hover:border-primary/50 transition-all"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {date.toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  <h3 className="font-semibold mb-2">{session.title}</h3>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{session.players.length}</span>
                    </div>
                    <div className="text-primary font-medium number-display">
                      {formatCurrency(session.totals.totalMoney, session.settings.currencySymbol)}
                    </div>
                    {winner && winner.netAmount > 0 && (
                      <div className="flex items-center gap-1 text-success">
                        <Trophy className="w-4 h-4" />
                        <span className="text-xs">{winner.playerName}</span>
                      </div>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
