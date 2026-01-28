import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GameSession } from '@/lib/types';
import { getSession, saveSession, saveActiveGame } from '@/lib/storage';
import { formatCurrency, generateWhatsAppMessage, getWhatsAppLink } from '@/lib/calculations';
import { downloadSessionPDF } from '@/lib/pdf';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Check, 
  Copy, 
  MessageCircle, 
  FileText, 
  ArrowRight,
  Calendar,
  Coins,
  Trophy,
  PlayCircle,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function SessionDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<GameSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadSession() {
      if (!id) return;
      try {
        const data = await getSession(id);
        if (data) {
          setSession(data);
        }
      } catch (error) {
        console.error('Error loading session:', error);
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, [id]);

  const handleToggleSettlement = async (settlementId: string) => {
    if (!session) return;

    const updatedSettlements = session.settlements.map(s =>
      s.id === settlementId
        ? { ...s, settled: !s.settled, settledAt: !s.settled ? new Date().toISOString() : undefined }
        : s
    );

    const updatedSession = {
      ...session,
      settlements: updatedSettlements,
    };

    setSession(updatedSession);
    await saveSession(updatedSession);
  };

  const handleCopyMessage = async () => {
    if (!session) return;
    const message = generateWhatsAppMessage(session);
    await navigator.clipboard.writeText(message);
    setCopied(true);
    toast.success('Message copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    if (!session) return;
    const message = generateWhatsAppMessage(session);
    window.open(getWhatsAppLink(message), '_blank');
  };

  const handleExportPDF = () => {
    if (!session) return;
    downloadSessionPDF(session);
    toast.success('PDF downloaded!');
  };

  const handleDuplicateSettings = async () => {
    if (!session) return;
    
    // Create a new game with same settings but no players
    const newGame: GameSession = {
      ...session,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: `${session.title} (Copy)`,
      players: [],
      results: [],
      settlements: [],
      totals: { totalBuyIns: 0, totalMoney: 0, totalChips: 0, expectedChips: 0 },
      createdAt: new Date().toISOString(),
      finishedAt: undefined,
      status: 'active',
    };

    await saveActiveGame(newGame);
    navigate('/');
    toast.success('New game started with same settings!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="p-4 safe-bottom">
        <Button variant="ghost" onClick={() => navigate('/history')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="text-center py-16">
          <p className="text-muted-foreground">Session not found</p>
        </div>
      </div>
    );
  }

  const sortedResults = [...session.results].sort((a, b) => b.netAmount - a.netAmount);
  const date = new Date(session.createdAt);

  return (
    <div className="p-4 safe-bottom animate-fade-in">
      {/* Header */}
      <Button variant="ghost" onClick={() => navigate('/history')} className="mb-4 -ml-2">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div className="mb-6">
        <h1 className="text-display-sm gradient-text mb-1">{session.title}</h1>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {date.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
        </div>
      </div>

      {/* Game Info */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="glass-card p-3">
          <div className="text-xs text-muted-foreground mb-1">Total Pot</div>
          <div className="text-xl font-bold text-primary number-display">
            {formatCurrency(session.totals.totalMoney, session.settings.currencySymbol)}
          </div>
        </div>
        <div className="glass-card p-3">
          <div className="text-xs text-muted-foreground mb-1">Buy-in</div>
          <div className="text-xl font-bold number-display">
            {formatCurrency(session.settings.buyInValue, session.settings.currencySymbol)}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="glass-card overflow-hidden mb-4">
        <div className="p-3 border-b border-border/50">
          <h2 className="font-semibold">Results</h2>
        </div>
        <div className="divide-y divide-border/50">
          {sortedResults.map((result, index) => (
            <div key={result.playerId} className="flex items-center justify-between p-3">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                  index === 0 && 'bg-gold text-gold-foreground',
                  index > 0 && 'bg-secondary text-muted-foreground'
                )}>
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium">{result.playerName}</div>
                  <div className="text-xs text-muted-foreground">
                    {result.buyIns} buy-in{result.buyIns !== 1 && 's'}
                  </div>
                </div>
              </div>
              <div className={cn(
                'font-bold number-display',
                result.netAmount > 0 && 'text-success',
                result.netAmount < 0 && 'text-destructive'
              )}>
                {result.netAmount > 0 && '+'}{formatCurrency(result.netAmount, session.settings.currencySymbol)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Settlements */}
      {session.settlements.length > 0 && (
        <div className="glass-card overflow-hidden mb-6">
          <div className="p-3 border-b border-border/50">
            <h2 className="font-semibold">Settlements</h2>
          </div>
          <div className="divide-y divide-border/50">
            {session.settlements.map((settlement) => (
              <button
                key={settlement.id}
                onClick={() => handleToggleSettlement(settlement.id)}
                className="w-full flex items-center justify-between p-3 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center',
                    settlement.settled ? 'bg-success' : 'bg-secondary'
                  )}>
                    {settlement.settled ? (
                      <Check className="w-4 h-4 text-success-foreground" />
                    ) : (
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    )}
                  </div>
                  <div className={cn('text-sm', settlement.settled && 'line-through opacity-60')}>
                    {settlement.fromPlayer} → {settlement.toPlayer}
                  </div>
                </div>
                <div className={cn('font-bold number-display', settlement.settled && 'opacity-60')}>
                  {formatCurrency(settlement.amount, session.settings.currencySymbol)}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary" onClick={handleCopyMessage} className="h-11">
            {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          <Button
            variant="secondary"
            onClick={handleWhatsAppShare}
            className="h-11 bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366]"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            WhatsApp
          </Button>
        </div>

        <Button variant="secondary" onClick={handleExportPDF} className="w-full h-11">
          <FileText className="w-4 h-4 mr-2" />
          Export PDF
        </Button>

        <Button onClick={handleDuplicateSettings} className="w-full h-11">
          <PlayCircle className="w-4 h-4 mr-2" />
          Play Again (Same Settings)
        </Button>
      </div>
    </div>
  );
}
