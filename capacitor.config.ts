import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pokersplit.app',
  appName: 'pokersplit',
  webDir: 'dist',
  server: {
    url: 'https://96ad2b28-a078-437d-a0c8-d7a1b5e01b74.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1a1a2e',
      showSpinner: false
    }
  }
};

export default config;
