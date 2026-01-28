import { GameTotals, GameSettings } from '@/lib/types';
import { formatCurrency, formatChips, getChipDifferenceWarning } from '@/lib/calculations';
import { Users, Coins, CircleDot, AlertTriangle } from 'lucide-react';

interface GameSummaryProps {
  totals: GameTotals;
  settings: GameSettings;
  playerCount: number;
}

export function GameSummary({ totals, settings, playerCount }: GameSummaryProps) {
  const warning = getChipDifferenceWarning(totals);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <div className="glass-card p-3 text-center">
          <Users className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
          <div className="text-xl font-bold number-display">{playerCount}</div>
          <div className="text-[10px] text-muted-foreground">Players</div>
        </div>
        
        <div className="glass-card p-3 text-center">
          <Coins className="w-4 h-4 mx-auto text-primary mb-1" />
          <div className="text-xl font-bold number-display text-primary">
            {formatCurrency(totals.totalMoney, settings.currencySymbol)}
          </div>
          <div className="text-[10px] text-muted-foreground">Total Pot</div>
        </div>
        
        <div className="glass-card p-3 text-center">
          <CircleDot className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
          <div className="text-xl font-bold number-display">{formatChips(totals.totalChips)}</div>
          <div className="text-[10px] text-muted-foreground">Total Chips</div>
        </div>
      </div>

      {warning && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-warning/10 border border-warning/20">
          <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
          <p className="text-xs text-warning">{warning}</p>
        </div>
      )}
    </div>
  );
}
