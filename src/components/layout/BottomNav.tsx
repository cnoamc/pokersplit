import { Link, useLocation } from 'react-router-dom';
import { Gamepad2, History, Trophy, BookOpen, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', icon: Trophy, label: 'Stats' },
  { path: '/game', icon: Gamepad2, label: 'Game' },
  { path: '/history', icon: History, label: 'History' },
  { path: '/rules', icon: BookOpen, label: 'Rules' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border/50">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = path === '/' 
            ? location.pathname === '/' 
            : location.pathname.startsWith(path);

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
              <div className="relative">
                <Icon className={cn('w-5 h-5', isActive && 'animate-scale-in')} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </div>
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
