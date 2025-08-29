'use client';

import { Container } from '@radix-ui/themes';
import { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <Container size="4">
      <main className="space-y-4">{children}</main>
    </Container>
  );
}
