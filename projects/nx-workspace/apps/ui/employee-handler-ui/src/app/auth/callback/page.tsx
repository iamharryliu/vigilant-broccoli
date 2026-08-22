'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '../../../../libs/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    getSupabase().then(supabase => {
      if (cancelled) return;
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        router.push(session ? '/' : '/login');
      });
      unsubscribe = () => subscription.unsubscribe();
    });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </main>
  );
}
