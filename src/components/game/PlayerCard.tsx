import { PlayerInGame, GameSettings, GameTotals } from '@/lib/types';
import { calculatePlayerResult, formatCurrency, formatChips } from '@/lib/calculations';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlayerCardProps {
  player: PlayerInGame;
  settings: GameSettings;
  totals: GameTotals;
  onUpdate: (updates: Partial<PlayerInGame>) => void;
  onRemove: () => void;
}

export function PlayerCard({ player, settings, totals, onUpdate, onRemove }: PlayerCardProps) {
  const result = calculatePlayerResult(player, settings, totals);
  const isProfit = result.netAmount > 0;
  const isLoss = result.netAmount < 0;

  const adjustBuyIns = (delta: number) => {
    const newBuyIns = Math.max(1, player.buyIns + delta);
    const chipDelta = delta * settings.chipsPerBuyIn;
    onUpdate({ 
      buyIns: newBuyIns,
      currentChips: Math.max(0, player.currentChips + chipDelta)
    });
  };

  return (
    <div 
      className={cn(
        'player-card animate-fade-in',
        isProfit && 'player-card-profit',
        isLoss && 'player-card-loss'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
            <User className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{player.name}</h3>
            <p className="text-xs text-muted-foreground">
              Invested: {formatCurrency(result.invested, settings.currencySymbol)}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="text-muted-foreground hover:text-destructive h-8 w-8"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Buy-ins Control */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-muted-foreground">Buy-ins</span>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="icon"
            onClick={() => adjustBuyIns(-1)}
            disabled={player.buyIns <= 1}
            className="h-9 w-9 rounded-full"
          >
            <Minus className="w-4 h-4" />
          </Button>
          <span className="w-12 text-center font-bold text-xl number-display">
            {player.buyIns}
          </span>
          <Button
            variant="secondary"
            size="icon"
            onClick={() => adjustBuyIns(1)}
            className="h-9 w-9 rounded-full"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Current Chips Input */}
      <div className="mb-4">
        <label className="text-sm text-muted-foreground block mb-2">Current Chips</label>
        <Input
          type="number"
          inputMode="numeric"
          value={player.currentChips || ''}
          onChange={(e) => onUpdate({ currentChips: parseInt(e.target.value) || 0 })}
          placeholder="0"
          className="input-poker text-xl font-bold text-center number-display"
        />
      </div>

      {/* Net Result Preview */}
      <div className={cn(
        'p-3 rounded-xl text-center',
        isProfit && 'bg-success/10',
        isLoss && 'bg-destructive/10',
        !isProfit && !isLoss && 'bg-secondary'
      )}>
        <div className="text-xs text-muted-foreground mb-1">Net Result</div>
        <div className={cn(
          'text-2xl font-bold number-display',
          isProfit && 'text-success',
          isLoss && 'text-destructive'
        )}>
          {isProfit && '+'}{formatCurrency(result.netAmount, settings.currencySymbol)}
        </div>
      </div>
    </div>
  );
}
