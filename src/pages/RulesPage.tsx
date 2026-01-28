import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/card';
import { 
  Spade, 
  Heart, 
  Diamond, 
  Clover, 
  ChevronDown,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';

const handRankings = [
  { name: 'Royal Flush', description: 'A, K, Q, J, 10 of the same suit', example: '🂡🂮🂭🂫🂪', rank: 1 },
  { name: 'Straight Flush', description: '5 consecutive cards of the same suit', example: '🂨🂧🂦🂥🂤', rank: 2 },
  { name: 'Four of a Kind', description: '4 cards of the same rank', example: '🂡🃁🃑🂱♠', rank: 3 },
  { name: 'Full House', description: '3 of a kind + a pair', example: '🂡🃁🃑🂮🃎', rank: 4 },
  { name: 'Flush', description: '5 cards of the same suit', example: '🂡🂮🂫🂧🂢', rank: 5 },
  { name: 'Straight', description: '5 consecutive cards', example: '🂨🃇🂦🃕🂤', rank: 6 },
  { name: 'Three of a Kind', description: '3 cards of the same rank', example: '🂡🃁🃑🂮🂧', rank: 7 },
  { name: 'Two Pair', description: '2 different pairs', example: '🂡🃁🂮🃎🂧', rank: 8 },
  { name: 'One Pair', description: '2 cards of the same rank', example: '🂡🃁🂮🂫🂧', rank: 9 },
  { name: 'High Card', description: 'Highest card wins', example: '🂡🂮🂫🂧🂢', rank: 10 },
];

const gameFlow = [
  { 
    name: 'Pre-Flop', 
    description: 'Each player receives 2 hole cards. First betting round begins with player left of big blind.',
    cards: 0
  },
  { 
    name: 'The Flop', 
    description: '3 community cards are dealt face-up. Second betting round.',
    cards: 3
  },
  { 
    name: 'The Turn', 
    description: '4th community card is dealt. Third betting round.',
    cards: 1
  },
  { 
    name: 'The River', 
    description: '5th and final community card. Final betting round.',
    cards: 1
  },
  { 
    name: 'Showdown', 
    description: 'Remaining players reveal hands. Best 5-card hand wins the pot.',
    cards: 0
  },
];

const beginnerMistakes = [
  {
    title: 'Playing too many hands',
    description: 'Fold weak starting hands. Patience is key.',
    icon: AlertCircle,
    type: 'warning'
  },
  {
    title: 'Ignoring position',
    description: 'Acting later gives you more information. Play tighter in early positions.',
    icon: Info,
    type: 'info'
  },
  {
    title: 'Chasing losses',
    description: 'Stick to your bankroll. Never play with money you can\'t afford to lose.',
    icon: AlertCircle,
    type: 'warning'
  },
  {
    title: 'Not betting for value',
    description: 'When you have a strong hand, bet to build the pot.',
    icon: CheckCircle,
    type: 'success'
  },
  {
    title: 'Showing emotions',
    description: 'Keep a poker face. Don\'t react to good or bad cards.',
    icon: Info,
    type: 'info'
  },
];

export default function RulesPage() {
  return (
    <div className="p-4 safe-bottom">
      <PageHeader title="Rules" subtitle="Learn Texas Hold'em" />

      <Accordion type="single" collapsible className="space-y-3">
        {/* Hand Rankings */}
        <AccordionItem value="rankings" className="glass-card border-0">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Spade className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <div className="font-semibold">Hand Rankings</div>
                <div className="text-xs text-muted-foreground">From Royal Flush to High Card</div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-2 pt-2">
              {handRankings.map((hand) => (
                <div 
                  key={hand.name}
                  className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                      {hand.rank}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{hand.name}</div>
                      <div className="text-xs text-muted-foreground">{hand.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Game Flow */}
        <AccordionItem value="flow" className="glass-card border-0">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Diamond className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <div className="font-semibold">Game Flow</div>
                <div className="text-xs text-muted-foreground">Pre-flop to Showdown</div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-3 pt-2">
              {gameFlow.map((stage, index) => (
                <div key={stage.name} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                      {index + 1}
                    </div>
                    {index < gameFlow.length - 1 && (
                      <div className="w-0.5 h-full bg-border my-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="font-semibold">{stage.name}</div>
                    <div className="text-sm text-muted-foreground">{stage.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Beginner Tips */}
        <AccordionItem value="tips" className="glass-card border-0">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <div className="font-semibold">Beginner Tips</div>
                <div className="text-xs text-muted-foreground">Avoid common mistakes</div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-2 pt-2">
              {beginnerMistakes.map((mistake) => (
                <div 
                  key={mistake.title}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-xl',
                    mistake.type === 'warning' && 'bg-warning/10',
                    mistake.type === 'info' && 'bg-primary/10',
                    mistake.type === 'success' && 'bg-success/10'
                  )}
                >
                  <mistake.icon className={cn(
                    'w-5 h-5 shrink-0 mt-0.5',
                    mistake.type === 'warning' && 'text-warning',
                    mistake.type === 'info' && 'text-primary',
                    mistake.type === 'success' && 'text-success'
                  )} />
                  <div>
                    <div className="font-medium text-sm">{mistake.title}</div>
                    <div className="text-xs text-muted-foreground">{mistake.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Actions */}
        <AccordionItem value="actions" className="glass-card border-0">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Clover className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <div className="font-semibold">Betting Actions</div>
                <div className="text-xs text-muted-foreground">Check, Bet, Call, Raise, Fold</div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-3 pt-2 text-sm">
              <div className="p-3 bg-secondary/50 rounded-xl">
                <span className="font-semibold text-primary">Check</span>
                <span className="text-muted-foreground"> — Pass the action without betting (only if no bet has been made)</span>
              </div>
              <div className="p-3 bg-secondary/50 rounded-xl">
                <span className="font-semibold text-primary">Bet</span>
                <span className="text-muted-foreground"> — Place the first wager in a betting round</span>
              </div>
              <div className="p-3 bg-secondary/50 rounded-xl">
                <span className="font-semibold text-primary">Call</span>
                <span className="text-muted-foreground"> — Match the current bet to stay in the hand</span>
              </div>
              <div className="p-3 bg-secondary/50 rounded-xl">
                <span className="font-semibold text-primary">Raise</span>
                <span className="text-muted-foreground"> — Increase the current bet amount</span>
              </div>
              <div className="p-3 bg-secondary/50 rounded-xl">
                <span className="font-semibold text-destructive">Fold</span>
                <span className="text-muted-foreground"> — Give up your hand and any chips you've put in</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
