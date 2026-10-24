'use client';

import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  LucideIcon,
} from 'lucide-react';
import { cn } from '@vigilant-broccoli/react-lib';

const ARROW_ICONS: Record<string, LucideIcon> = {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
};

const CODE_PREFIXES = /^(Key|Digit|Numpad)/;

export const keyLabel = (code: string) => code.replace(CODE_PREFIXES, '');

export function KeyCap({
  code,
  className,
}: {
  code: string;
  className?: string;
}) {
  const Arrow = ARROW_ICONS[code];
  return (
    <kbd
      className={cn(
        'inline-flex h-8 min-w-8 items-center justify-center rounded-md border border-b-4 border-border bg-muted px-2 font-mono text-xs font-semibold text-foreground',
        className,
      )}
    >
      {Arrow ? <Arrow className="h-4 w-4" aria-label={code} /> : keyLabel(code)}
    </kbd>
  );
}
