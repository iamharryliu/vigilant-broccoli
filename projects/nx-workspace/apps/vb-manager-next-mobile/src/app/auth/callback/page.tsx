'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../../libs/supabase';
import { PAGE_MIN_HEIGHT } from '../../components/app-shell';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      router.push(session ? '/' : '/login');
    });
    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <main
      className={`${PAGE_MIN_HEIGHT} flex items-center justify-center bg-gray-50`}
    >
      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </main>
  );
}
