import type { ReactNode } from 'react';

export function CenteredAppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
  );
}
