'use client';

import { Container } from '@radix-ui/themes';
import { ReactNode } from 'react';
import { APP_ROUTE } from '../app.consts';
import { NextNavBar } from '@vigilant-broccoli/next-lib';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <Container size="4">
      <NextNavBar routes={Object.values(APP_ROUTE)} />
      <main className="space-y-4">{children}</main>
    </Container>
  );
}
