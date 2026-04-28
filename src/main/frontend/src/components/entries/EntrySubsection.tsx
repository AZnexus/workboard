import type { ReactNode } from 'react';
import { Pin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EntrySubsectionProps {
  title: string;
  count: number;
  tone: 'fixed' | 'regular';
  children: ReactNode;
}

export function EntrySubsection({ title, count, tone, children }: EntrySubsectionProps) {
  const isFixed = tone === 'fixed';
  
  return (
    <div 
      className={cn(
        "flex flex-col gap-3 rounded-lg p-3 transition-colors",
        isFixed 
          ? "bg-accent-primary/5 border border-accent-primary/20" 
          : ""
      )}
    >
      <div className="flex items-center gap-2 px-1">
        {isFixed && (
          <Pin 
            data-testid="pin-icon" 
            className="h-3.5 w-3.5 text-accent-primary" 
            aria-hidden="true"
          />
        )}
        <h3 className={cn(
          "text-sm font-medium",
          isFixed ? "text-accent-primary" : "text-muted-foreground"
        )}>
          {title}
        </h3>
        <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full font-medium">
          {count}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {children}
      </div>
    </div>
  );
}
