'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../../../libs/supabase';
import { ROUTES } from '../../../lib/routes';
import { GOOGLE_TOKEN_STORAGE_KEY } from '../../hooks/use-google-token';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.provider_token) {
        localStorage.setItem(GOOGLE_TOKEN_STORAGE_KEY, session.provider_token);
      }
      const next = searchParams.get('next');
      router.push(session ? next || ROUTES.HOME : ROUTES.LOGIN);
    });
    return () => subscription.unsubscribe();
  }, [router, searchParams]);

  return <p>Signing you in...</p>;
}
