import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '../utils/cn';

const CARD_CLASS =
  'rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden';

export type CardProps = HTMLAttributes<HTMLDivElement>;

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(CARD_CLASS, className)} {...props} />
  ),
);
Card.displayName = 'Card';
