import type { ReactNode } from 'react';

export function Card({ children }: { children: ReactNode }) {
  return (
    <div className="shadow-lg pt-8 pb-8 mb-8 rounded-lg">
      <div className="w-11/12 mx-auto">{children}</div>
    </div>
  );
}
