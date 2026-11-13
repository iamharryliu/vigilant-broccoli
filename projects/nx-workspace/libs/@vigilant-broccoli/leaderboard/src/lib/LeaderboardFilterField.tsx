import { ReactNode } from 'react';
import { cn } from '@vigilant-broccoli/react-lib';

interface LeaderboardFilterFieldProps {
  label: string;
  children: ReactNode;
  className?: string;
  labelClassName?: string;
}

export function LeaderboardFilterField({
  label,
  children,
  className,
  labelClassName,
}: LeaderboardFilterFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <span
        className={cn(
          'text-xs text-muted-foreground font-medium',
          labelClassName,
        )}
      >
        {label}
      </span>
      {children}
    </div>
  );
}
