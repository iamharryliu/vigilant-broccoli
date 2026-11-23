import { ReactNode } from 'react';

export function CardGrid({ children }: { children: ReactNode }) {
  return <ul className="grid gap-4">{children}</ul>;
}
