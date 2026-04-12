'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../../libs/supabase';
import { ROUTES } from '../../../lib/routes';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      router.push(session ? ROUTES.HOME : ROUTES.LOGIN);
    });
    return () => subscription.unsubscribe();
  }, [router]);

  return <p>Signing you in...</p>;
}
