'use client';

import { ReactNode } from 'react';
import { AuthContextProvider } from '../../../contexts/auth.context';

export default function Layout({ children }: { children: ReactNode }) {
  return <AuthContextProvider>{children}</AuthContextProvider>;
}
