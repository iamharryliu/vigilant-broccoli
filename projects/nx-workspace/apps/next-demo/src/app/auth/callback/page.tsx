'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../../libs/supabase';

const DASHBOARD_ROUTE = '/dashboard';
const LOGIN_ROUTE = '/login';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        router.push(DASHBOARD_ROUTE);
      } else {
        router.push(LOGIN_ROUTE);
      }
    });
  }, [router]);

  return <p>Signing you in...</p>;
}
