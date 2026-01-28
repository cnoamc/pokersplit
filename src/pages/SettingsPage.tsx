import { useEffect, useState } from 'react';
import { AppSettings, defaultAppSettings } from '@/lib/types';
import { getAppSettings, saveAppSettings, resetAllData } from '@/lib/storage';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Moon, Sun, DollarSign, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(defaultAppSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await getAppSettings();
        setSettings(data);
        // Apply dark mode
        if (data.darkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const updateSetting = async <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await saveAppSettings(newSettings);

    if (key === 'darkMode') {
      if (value) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const handleResetAllData = async () => {
    try {
      await resetAllData();
      toast.success('All data has been reset');
    } catch (error) {
      console.error('Error resetting data:', error);
      toast.error('Failed to reset data');
    }
  };

  if (loading) {
    return (
      <div className="p-4 safe-bottom">
        <PageHeader title="Settings" subtitle="Customize your app" />
        <div className="space-y-4">
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
      <PageHeader title="Settings" subtitle="Customize your app" />

      <div className="space-y-4">
        {/* Dark Mode Toggle */}
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {settings.darkMode ? (
                <Moon className="w-5 h-5 text-primary" />
              ) : (
                <Sun className="w-5 h-5 text-warning" />
              )}
              <div>
                <Label className="font-medium">Dark Mode</Label>
                <p className="text-xs text-muted-foreground">Toggle dark/light theme</p>
              </div>
            </div>
            <Switch
              checked={settings.darkMode}
              onCheckedChange={(checked) => updateSetting('darkMode', checked)}
            />
          </div>
        </div>

        {/* Currency Symbol */}
        <div className="glass-card p-4">
          <div className="flex items-center gap-3 mb-3">
            <DollarSign className="w-5 h-5 text-primary" />
            <div>
              <Label className="font-medium">Currency Symbol</Label>
              <p className="text-xs text-muted-foreground">Default currency for new games</p>
            </div>
          </div>
          <Input
            type="text"
            value={settings.currencySymbol}
            onChange={(e) => updateSetting('currencySymbol', e.target.value.slice(0, 3))}
            placeholder="₪"
            className="input-poker w-20"
            maxLength={3}
          />
        </div>

        {/* Default Values */}
        <div className="glass-card p-4 space-y-4">
          <div>
            <Label className="font-medium">Default Buy-in ({settings.currencySymbol})</Label>
            <p className="text-xs text-muted-foreground mb-2">Pre-filled value for new games</p>
            <Input
              type="number"
              inputMode="decimal"
              value={settings.defaultBuyIn}
              onChange={(e) => updateSetting('defaultBuyIn', parseFloat(e.target.value) || 50)}
              placeholder="50"
              className="input-poker w-32"
            />
          </div>
          <div>
            <Label className="font-medium">Default Chips per Buy-in</Label>
            <p className="text-xs text-muted-foreground mb-2">Pre-filled value for new games</p>
            <Input
              type="number"
              inputMode="numeric"
              value={settings.defaultChipsPerBuyIn}
              onChange={(e) => updateSetting('defaultChipsPerBuyIn', parseInt(e.target.value) || 1000)}
              placeholder="1000"
              className="input-poker w-32"
            />
          </div>
        </div>

        {/* Reset All Data */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="destructive" 
              className="w-full h-12"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Reset All Data
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="glass-card">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Delete All Data?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete all your game history, player statistics, and settings. 
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleResetAllData}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Everything
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* App Info */}
        <div className="text-center py-6 text-muted-foreground text-xs">
          <p>PokerSplit v1.0</p>
          <p>Made with ♠️ for poker nights</p>
        </div>
      </div>
    </div>
  );
}
