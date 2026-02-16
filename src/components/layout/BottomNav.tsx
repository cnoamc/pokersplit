import { Link, useLocation } from 'react-router-dom';
import { Gamepad2, History, Trophy, BookOpen, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/game', icon: Gamepad2, label: 'Game' },
  { path: '/history', icon: History, label: 'History' },
  { path: '/', icon: Trophy, label: 'Stats', isCenter: true },
  { path: '/rules', icon: BookOpen, label: 'Rules' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border/50">
      <div className="flex items-end justify-around h-16 max-w-md mx-auto px-2" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {navItems.map(({ path, icon: Icon, label, isCenter }) => {
          const isActive = path === '/' 
            ? location.pathname === '/' 
            : location.pathname.startsWith(path);

          if (isCenter) {
            return (
              <Link
                key={path}
                to={path}
                className="flex flex-col items-center justify-center gap-1 -mt-5 transition-all duration-200"
              >
                <div className={cn(
                  'w-14 h-14 rounded-full flex items-center justify-center shadow-lg animate-pulse-glow',
                  'bg-primary text-primary-foreground',
                  isActive && 'ring-4 ring-primary/30'
                )}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className={cn('text-[10px] font-medium', isActive ? 'text-primary' : 'text-muted-foreground')}>{label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={path}
              to={path}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-200',
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className={cn('w-5 h-5', isActive && 'animate-scale-in')} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
