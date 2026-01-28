import { GameSession, GameResult, Settlement, PlayerInGame, GameSettings, GameTotals } from './types';
import { generateId } from './storage';

export function calculateTotals(players: PlayerInGame[], settings: GameSettings): GameTotals {
  const totalBuyIns = players.reduce((sum, p) => sum + p.buyIns, 0);
  const totalMoney = totalBuyIns * settings.buyInValue;
  const totalChips = players.reduce((sum, p) => sum + p.currentChips, 0);
  const expectedChips = totalBuyIns * settings.chipsPerBuyIn;
  
  return {
    totalBuyIns,
    totalMoney,
    totalChips,
    expectedChips,
  };
}

export function calculatePlayerResult(
  player: PlayerInGame,
  settings: GameSettings,
  totals: GameTotals
): GameResult {
  const invested = player.buyIns * settings.buyInValue;
  
  let cashOut: number;
  let chipValue: number;
  
  if (settings.mode === 'money') {
    // Money mode: chip value is calculated from total money / total chips
    chipValue = totals.totalChips > 0 ? totals.totalMoney / totals.totalChips : 0;
    cashOut = player.currentChips * chipValue;
  } else {
    // Points mode: chips represent money (chipsPerBuyIn = buyInValue worth of chips)
    chipValue = settings.buyInValue / settings.chipsPerBuyIn;
    cashOut = player.currentChips * chipValue;
  }
  
  const netAmount = cashOut - invested;
  
  return {
    playerName: player.name,
    playerId: player.id,
    buyIns: player.buyIns,
    chips: player.currentChips,
    invested,
    cashOut,
    netAmount,
  };
}

export function calculateAllResults(session: GameSession): GameResult[] {
  const totals = calculateTotals(session.players, session.settings);
  return session.players.map(player => 
    calculatePlayerResult(player, session.settings, totals)
  );
}

export function calculateSettlements(results: GameResult[]): Settlement[] {
  // Separate winners and losers
  const winners = results
    .filter(r => r.netAmount > 0)
    .sort((a, b) => b.netAmount - a.netAmount);
  
  const losers = results
    .filter(r => r.netAmount < 0)
    .sort((a, b) => a.netAmount - b.netAmount); // Most negative first
  
  const settlements: Settlement[] = [];
  
  // Create a copy of amounts to track remaining balances
  const winnerBalances = winners.map(w => ({ ...w, remaining: w.netAmount }));
  const loserBalances = losers.map(l => ({ ...l, remaining: Math.abs(l.netAmount) }));
  
  // Match losers to winners
  for (const loser of loserBalances) {
    while (loser.remaining > 0.01) { // Use 0.01 to handle floating point
      // Find a winner who still needs to be paid
      const winner = winnerBalances.find(w => w.remaining > 0.01);
      if (!winner) break;
      
      // Calculate settlement amount
      const amount = Math.min(loser.remaining, winner.remaining);
      
      if (amount > 0.01) {
        settlements.push({
          id: generateId(),
          fromPlayer: loser.playerName,
          fromPlayerId: loser.playerId,
          toPlayer: winner.playerName,
          toPlayerId: winner.playerId,
          amount: Math.round(amount * 100) / 100, // Round to 2 decimal places
          settled: false,
        });
      }
      
      loser.remaining -= amount;
      winner.remaining -= amount;
    }
  }
  
  return settlements;
}

export function formatCurrency(amount: number, symbol: string = '₪'): string {
  const absAmount = Math.abs(amount);
  const formatted = absAmount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  
  if (amount < 0) {
    return `-${symbol}${formatted}`;
  }
  return `${symbol}${formatted}`;
}

export function formatChips(chips: number): string {
  return chips.toLocaleString('en-US');
}

export function getChipDifferenceWarning(totals: GameTotals): string | null {
  const diff = Math.abs(totals.totalChips - totals.expectedChips);
  const diffPercent = totals.expectedChips > 0 
    ? (diff / totals.expectedChips) * 100 
    : 0;
  
  if (diffPercent > 5) {
    const direction = totals.totalChips > totals.expectedChips ? 'more' : 'fewer';
    return `Warning: Total chips entered is ${diff.toLocaleString()} ${direction} than expected (${diffPercent.toFixed(1)}% difference)`;
  }
  
  return null;
}

export function generateWhatsAppMessage(session: GameSession): string {
  const { settings, results, settlements, totals } = session;
  
  let message = `🃏 *Poker Night Summary* ♠️\n\n`;
  message += `📅 ${new Date(session.finishedAt || session.createdAt).toLocaleDateString()}\n`;
  message += `💰 Buy-in: ${formatCurrency(settings.buyInValue, settings.currencySymbol)} (${formatChips(settings.chipsPerBuyIn)} chips)\n`;
  message += `🏆 Total Pot: ${formatCurrency(totals.totalMoney, settings.currencySymbol)}\n\n`;
  
  message += `*Results:*\n`;
  const sortedResults = [...results].sort((a, b) => b.netAmount - a.netAmount);
  
  for (const result of sortedResults) {
    const emoji = result.netAmount > 0 ? '🟢' : result.netAmount < 0 ? '🔴' : '⚪';
    const sign = result.netAmount > 0 ? '+' : '';
    message += `${emoji} ${result.playerName}: ${sign}${formatCurrency(result.netAmount, settings.currencySymbol)}\n`;
  }
  
  if (settlements.length > 0) {
    message += `\n*Settlements:*\n`;
    for (const s of settlements) {
      const status = s.settled ? '✅' : '⏳';
      message += `${status} ${s.fromPlayer} ➜ ${s.toPlayer}: ${formatCurrency(s.amount, settings.currencySymbol)}\n`;
    }
  }
  
  message += `\n_Generated by PokerSplit_`;
  
  return message;
}

export function getWhatsAppLink(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
