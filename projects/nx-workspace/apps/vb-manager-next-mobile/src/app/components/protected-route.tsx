'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { authClient } from '../../../libs/auth-client';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/login');
    }
  }, [isPending, router, session]);

  if (isPending) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return session ? <>{children}</> : null;
};
