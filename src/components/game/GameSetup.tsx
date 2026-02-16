import { useState, useEffect } from 'react';
import { GameMode, Player } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlayerSelector } from '@/components/players/PlayerSelector';
import { Coins, Target, Sparkles, ChevronRight, ChevronLeft, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePlayers } from '@/hooks/usePlayers';

interface GameSetupProps {
  onStart: (mode: GameMode, buyInValue: number, chipsPerBuyIn: number, title?: string, playerIds?: string[]) => void;
  currencySymbol: string;
}

export function GameSetup({ onStart, currencySymbol }: GameSetupProps) {
  const [step, setStep] = useState<'settings' | 'players'>('settings');
  const [mode, setMode] = useState<GameMode>('money');
  const [buyInValue, setBuyInValue] = useState('50');
  const [chipsPerBuyIn, setChipsPerBuyIn] = useState('1000');
  const [title, setTitle] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);

  const { players, addPlayer, checkDuplicateName } = usePlayers();

  const validateSettings = () => {
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
    return Object.keys(newErrors).length === 0;
  };

  const handleContinueToPlayers = () => {
    if (validateSettings()) {
      setStep('players');
    }
  };

  const handleTogglePlayer = (player: Player) => {
    setSelectedPlayers(prev => {
      const isSelected = prev.some(p => p.id === player.id);
      if (isSelected) {
        return prev.filter(p => p.id !== player.id);
      } else {
        return [...prev, player];
      }
    });
  };

  const handleCreatePlayer = async (name: string): Promise<Player> => {
    const player = await addPlayer(name);
    setSelectedPlayers(prev => [...prev, player]);
    return player;
  };

  const handleStart = () => {
    const buyIn = parseFloat(buyInValue);
    const chips = parseInt(chipsPerBuyIn);
    const playerIds = selectedPlayers.map(p => p.id);
    onStart(mode, buyIn, chips, title.trim() || undefined, playerIds);
  };

  if (step === 'players') {
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setStep('settings')}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Select Players</h1>
            <p className="text-sm text-muted-foreground">Choose who's playing tonight</p>
          </div>
        </div>

        {/* Player Selection */}
        <PlayerSelector
          players={players}
          selectedPlayers={selectedPlayers}
          onTogglePlayer={handleTogglePlayer}
          onCreatePlayer={handleCreatePlayer}
          checkDuplicateName={checkDuplicateName}
        />

        {/* Start Button */}
        <Button 
          onClick={handleStart}
          disabled={selectedPlayers.length < 2}
          className="w-full h-14 text-lg font-semibold chip-button bg-primary hover:bg-primary/90"
          size="lg"
        >
          Start Game
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>

        {selectedPlayers.length < 2 && (
          <p className="text-center text-sm text-muted-foreground">
            Select at least 2 players to start
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero */}
      <div className="text-center py-6">
        <h1 className="text-2xl font-bold gradient-text mb-2">New Game</h1>
        <p className="text-muted-foreground">Set up your poker night</p>
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

      {/* Continue Button */}
      <Button 
        onClick={handleContinueToPlayers}
        className="w-full h-14 text-lg font-semibold chip-button bg-primary hover:bg-primary/90"
        size="lg"
      >
        <Users className="w-5 h-5 mr-2" />
        Select Players
        <ChevronRight className="w-5 h-5 ml-2" />
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
