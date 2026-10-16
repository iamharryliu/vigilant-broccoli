'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../../libs/supabase';
import { PAGE_TITLE } from '../../app.const';
import { usePageTitle } from '../../use-page-title';

export default function AuthCallbackPage() {
  usePageTitle(PAGE_TITLE.AUTH_CALLBACK);
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
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </main>
  );
}
