import { ReactNode } from 'react';

export function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
      {children}
    </h2>
  );
}
