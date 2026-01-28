import { GameSession } from '@/lib/types';
import { formatCurrency, generateWhatsAppMessage, getWhatsAppLink } from '@/lib/calculations';
import { downloadSessionPDF } from '@/lib/pdf';
import { Button } from '@/components/ui/button';
import { 
  Check, 
  Copy, 
  MessageCircle, 
  FileText, 
  ChevronRight, 
  Trophy,
  TrendingDown,
  ArrowRight,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { toast } from 'sonner';

interface GameResultsProps {
  game: GameSession;
  onToggleSettlement: (settlementId: string) => void;
  onNewGame: () => void;
}

export function GameResults({ game, onToggleSettlement, onNewGame }: GameResultsProps) {
  const [copied, setCopied] = useState(false);

  const sortedResults = [...game.results].sort((a, b) => b.netAmount - a.netAmount);
  const winner = sortedResults[0];
  const loser = sortedResults[sortedResults.length - 1];

  const handleCopyMessage = async () => {
    const message = generateWhatsAppMessage(game);
    await navigator.clipboard.writeText(message);
    setCopied(true);
    toast.success('Message copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const message = generateWhatsAppMessage(game);
    window.open(getWhatsAppLink(message), '_blank');
  };

  const handleExportPDF = () => {
    downloadSessionPDF(game);
    toast.success('PDF downloaded!');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center py-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-3">
          <Trophy className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-display-sm gradient-text">Game Complete!</h1>
        <p className="text-muted-foreground text-sm mt-1">{game.title}</p>
      </div>

      {/* Winner/Loser Highlights */}
      {winner && loser && (
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card p-4 border-l-4 border-l-success">
            <div className="text-xs text-muted-foreground mb-1">Biggest Winner</div>
            <div className="font-semibold">{winner.playerName}</div>
            <div className="text-success font-bold number-display">
              +{formatCurrency(winner.netAmount, game.settings.currencySymbol)}
            </div>
          </div>
          <div className="glass-card p-4 border-l-4 border-l-destructive">
            <div className="text-xs text-muted-foreground mb-1">Biggest Loser</div>
            <div className="font-semibold">{loser.playerName}</div>
            <div className="text-destructive font-bold number-display">
              {formatCurrency(loser.netAmount, game.settings.currencySymbol)}
            </div>
          </div>
        </div>
      )}

      {/* Results Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-3 border-b border-border/50">
          <h2 className="font-semibold">Final Results</h2>
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
                    {result.buyIns} buy-in{result.buyIns !== 1 && 's'} • {result.chips.toLocaleString()} chips
                  </div>
                </div>
              </div>
              <div className={cn(
                'font-bold number-display',
                result.netAmount > 0 && 'text-success',
                result.netAmount < 0 && 'text-destructive'
              )}>
                {result.netAmount > 0 && '+'}{formatCurrency(result.netAmount, game.settings.currencySymbol)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Settlements */}
      {game.settlements.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="p-3 border-b border-border/50">
            <h2 className="font-semibold">Settlements</h2>
          </div>
          <div className="divide-y divide-border/50">
            {game.settlements.map((settlement) => (
              <button
                key={settlement.id}
                onClick={() => onToggleSettlement(settlement.id)}
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
                  <div className="text-left">
                    <div className={cn('text-sm', settlement.settled && 'line-through opacity-60')}>
                      {settlement.fromPlayer} <ArrowRight className="inline w-3 h-3" /> {settlement.toPlayer}
                    </div>
                  </div>
                </div>
                <div className={cn(
                  'font-bold number-display',
                  settlement.settled && 'opacity-60'
                )}>
                  {formatCurrency(settlement.amount, game.settings.currencySymbol)}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Share Actions */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="secondary"
            onClick={handleCopyMessage}
            className="h-12"
          >
            {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          <Button
            variant="secondary"
            onClick={handleWhatsAppShare}
            className="h-12 bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366]"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            WhatsApp
          </Button>
        </div>
        
        <Button
          variant="secondary"
          onClick={handleExportPDF}
          className="w-full h-12"
        >
          <FileText className="w-4 h-4 mr-2" />
          Export PDF
        </Button>
      </div>

      {/* New Game Button */}
      <Button
        onClick={onNewGame}
        className="w-full h-14 text-lg font-semibold chip-button bg-primary hover:bg-primary/90"
        size="lg"
      >
        <Plus className="w-5 h-5 mr-2" />
        New Game
      </Button>
    </div>
  );
}
