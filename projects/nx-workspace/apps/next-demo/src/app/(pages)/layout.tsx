'use client';

import { Container } from '@radix-ui/themes';
import { ReactNode } from 'react';
import { APP_ROUTE } from '../app.consts';
import { NextNavBar } from '@vigilant-broccoli/next-lib';
import { ErrorContextProvider } from '../components/providers/ErrorProvider';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <Container size="4">
      <NextNavBar routes={Object.values(APP_ROUTE)} />
      <ErrorContextProvider>
        <main className="space-y-4">{children}</main>
      </ErrorContextProvider>
    </Container>
  );
}
