import { useState } from 'react';
import { GameMode } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Coins, Target, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GameSetupProps {
  onStart: (mode: GameMode, buyInValue: number, chipsPerBuyIn: number, title?: string) => void;
  currencySymbol: string;
}

export function GameSetup({ onStart, currencySymbol }: GameSetupProps) {
  const [mode, setMode] = useState<GameMode>('money');
  const [buyInValue, setBuyInValue] = useState('50');
  const [chipsPerBuyIn, setChipsPerBuyIn] = useState('1000');
  const [title, setTitle] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateAndStart = () => {
    const newErrors: Record<string, string> = {};
    
    const buyIn = parseFloat(buyInValue);
    const chips = parseInt(chipsPerBuyIn);

    if (!buyIn || buyIn <= 0) {
      newErrors.buyIn = 'Enter a valid buy-in value';
    }
    if (!chips || chips <= 0) {
      newErrors.chips = 'Enter a valid chip amount';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onStart(mode, buyIn, chips, title.trim() || undefined);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero */}
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mb-4">
          <Sparkles className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-display gradient-text mb-2">PokerSplit</h1>
        <p className="text-muted-foreground">Track your poker night like a pro</p>
      </div>

      {/* Mode Selection */}
      <div className="space-y-3">
        <Label className="text-sm text-muted-foreground">Game Mode</Label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setMode('money')}
            className={cn(
              'glass-card p-4 text-left transition-all duration-200',
              mode === 'money' 
                ? 'ring-2 ring-primary shadow-glow' 
                : 'hover:border-primary/50'
            )}
          >
            <Coins className={cn('w-6 h-6 mb-2', mode === 'money' ? 'text-primary' : 'text-muted-foreground')} />
            <div className="font-semibold">Money Mode</div>
            <div className="text-xs text-muted-foreground mt-1">
              Chip value = total pot / total chips
            </div>
          </button>

          <button
            onClick={() => setMode('points')}
            className={cn(
              'glass-card p-4 text-left transition-all duration-200',
              mode === 'points' 
                ? 'ring-2 ring-primary shadow-glow' 
                : 'hover:border-primary/50'
            )}
          >
            <Target className={cn('w-6 h-6 mb-2', mode === 'points' ? 'text-primary' : 'text-muted-foreground')} />
            <div className="font-semibold">Points Mode</div>
            <div className="text-xs text-muted-foreground mt-1">
              Fixed chip-to-money ratio
            </div>
          </button>
        </div>
      </div>

      {/* Settings Inputs */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="buyIn" className="text-sm text-muted-foreground">
            Buy-in Value ({currencySymbol})
          </Label>
          <Input
            id="buyIn"
            type="number"
            inputMode="decimal"
            value={buyInValue}
            onChange={(e) => setBuyInValue(e.target.value)}
            placeholder="50"
            className={cn('input-poker mt-2', errors.buyIn && 'ring-2 ring-destructive')}
          />
          {errors.buyIn && <p className="text-destructive text-xs mt-1">{errors.buyIn}</p>}
        </div>

        <div>
          <Label htmlFor="chips" className="text-sm text-muted-foreground">
            Chips per Buy-in
          </Label>
          <Input
            id="chips"
            type="number"
            inputMode="numeric"
            value={chipsPerBuyIn}
            onChange={(e) => setChipsPerBuyIn(e.target.value)}
            placeholder="1000"
            className={cn('input-poker mt-2', errors.chips && 'ring-2 ring-destructive')}
          />
          {errors.chips && <p className="text-destructive text-xs mt-1">{errors.chips}</p>}
        </div>

        <div>
          <Label htmlFor="title" className="text-sm text-muted-foreground">
            Game Title (optional)
          </Label>
          <Input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Friday Night Poker"
            className="input-poker mt-2"
          />
        </div>
      </div>

      {/* Start Button */}
      <Button 
        onClick={validateAndStart}
        className="w-full h-14 text-lg font-semibold chip-button bg-primary hover:bg-primary/90"
        size="lg"
      >
        Start Game
      </Button>

      {/* Mode Explanation */}
      <div className="glass-card p-4 text-sm">
        <div className="text-muted-foreground">
          {mode === 'money' ? (
            <>
              <strong className="text-foreground">Money Mode:</strong> Each buy-in adds {currencySymbol}{buyInValue || '50'} to the pot. 
              At the end, chip value = total pot ÷ total chips. Great for casual home games.
            </>
          ) : (
            <>
              <strong className="text-foreground">Points Mode:</strong> {chipsPerBuyIn || '1000'} chips = {currencySymbol}{buyInValue || '50'}. 
              Fixed conversion rate throughout the game.
            </>
          )}
        </div>
      </div>
    </div>
  );
}
