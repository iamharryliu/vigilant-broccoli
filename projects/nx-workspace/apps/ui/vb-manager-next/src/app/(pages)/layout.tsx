'use client';

import { Container } from '@radix-ui/themes';
import { ReactNode } from 'react';
import { NextNavBar } from '@vigilant-broccoli/next-lib';
import { APP_ROUTE } from '../app.const';
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <Container size="4">
      <NextNavBar routes={Object.values(APP_ROUTE)} />
      <main className="space-y-4">{children}</main>
    </Container>
  );
}
