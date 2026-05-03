'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '../providers/auth-provider';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const session = useAuth();

  useEffect(() => {
    if (session === null) {
      router.push('/login');
    }
  }, [router, session]);

  return session ? <>{children}</> : null;
};
