import { ReactNode } from 'react';
import { cn } from '@vigilant-broccoli/react-lib';

export function SectionHeading({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        'mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400',
        className,
      )}
    >
      {children}
    </h2>
  );
}
