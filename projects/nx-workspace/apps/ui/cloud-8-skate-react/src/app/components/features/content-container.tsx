import type { ReactNode } from 'react';

export function ContentContainer({ children }: { children: ReactNode }) {
  return (
    <div className="lg:w-1/2 mx-auto">
      <div className="px-4 pt-24 pb-8 lg:px-0 lg:pt-24 lg:pb-12">
        {children}
      </div>
    </div>
  );
}
