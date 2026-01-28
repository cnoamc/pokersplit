export type GameMode = 'money' | 'points';

export interface GameSettings {
  mode: GameMode;
  buyInValue: number;
  chipsPerBuyIn: number;
  currencySymbol: string;
  createdAt: string;
}

export interface PlayerInGame {
  id: string;
  name: string;
  buyIns: number;
  currentChips: number;
}

export interface GameResult {
  playerName: string;
  playerId: string;
  buyIns: number;
  chips: number;
  invested: number;
  cashOut: number;
  netAmount: number;
}

export interface Settlement {
  id: string;
  fromPlayer: string;
  fromPlayerId: string;
  toPlayer: string;
  toPlayerId: string;
  amount: number;
  settled: boolean;
  settledAt?: string;
}

export interface GameTotals {
  totalBuyIns: number;
  totalMoney: number;
  totalChips: number;
  expectedChips: number;
}

export interface GameSession {
  id: string;
  title: string;
  settings: GameSettings;
  players: PlayerInGame[];
  results: GameResult[];
  settlements: Settlement[];
  totals: GameTotals;
  createdAt: string;
  finishedAt?: string;
  status: 'active' | 'finished';
}

export interface PlayerStats {
  playerId: string;
  playerName: string;
  gamesPlayed: number;
  totalNet: number;
  averageNet: number;
  biggestWin: number;
  biggestLoss: number;
  winRate: number;
  lastPlayedAt: string;
}

export interface AppSettings {
  currencySymbol: string;
  darkMode: boolean;
  defaultBuyIn: number;
  defaultChipsPerBuyIn: number;
}

export const defaultAppSettings: AppSettings = {
  currencySymbol: '₪',
  darkMode: true,
  defaultBuyIn: 50,
  defaultChipsPerBuyIn: 1000,
};
