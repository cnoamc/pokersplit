import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { addPlayer } from '@/lib/storage';
import { saveAppOwner } from '@/lib/storage';
import { AppOwner } from '@/lib/types';
import logo from '@/assets/logo.png';

interface WelcomePageProps {
  onComplete: () => void;
}

const WelcomePage = ({ onComplete }: WelcomePageProps) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Please enter your name');
      return;
    }
    const ageNum = parseInt(age);
    if (!age || isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
      setError('Please enter a valid age (13+)');
      return;
    }

    setLoading(true);
    try {
      const player = await addPlayer(trimmedName);
      const owner: AppOwner = {
        playerId: player.id,
        displayName: trimmedName,
        age: ageNum,
        onboardingComplete: true,
        createdAt: new Date().toISOString(),
      };
      await saveAppOwner(owner);
      onComplete();
    } catch (e) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm space-y-8 animate-fade-in">
        {/* Logo */}
        <div className="flex justify-center">
          <img src={logo} alt="Split Poker" className="w-40 h-40 rounded-3xl shadow-2xl" />
        </div>

        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Welcome to Split Poker</h1>
          <p className="text-muted-foreground text-sm">Set up your profile to get started</p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Your Name</label>
            <Input
              className="input-poker"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              maxLength={30}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Your Age</label>
            <Input
              className="input-poker"
              type="number"
              placeholder="Enter your age"
              value={age}
              onChange={(e) => { setAge(e.target.value); setError(''); }}
              min={13}
              max={120}
              inputMode="numeric"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          <Button
            className="w-full h-12 text-base font-semibold rounded-xl"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Setting up...' : "Let's Play! ♠"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
