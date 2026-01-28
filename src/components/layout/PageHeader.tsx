import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <header className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-display-sm gradient-text">{title}</h1>
        {subtitle && (
          <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </header>
  );
}
