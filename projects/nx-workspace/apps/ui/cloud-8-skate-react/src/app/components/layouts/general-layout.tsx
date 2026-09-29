import type { ReactNode } from 'react';
import { NavbarSection } from '../features/navbar-section';

export function GeneralLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <NavbarSection />
      <main>{children}</main>
    </>
  );
}
