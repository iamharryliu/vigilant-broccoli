'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../../../libs/supabase';
import { ROUTES } from '../../../lib/routes';
import { resolvePostAuthPath } from '../../../lib/auth-redirect';
import { GOOGLE_TOKEN_STORAGE_KEY } from '../../hooks/use-google-token';
import { PAGE_TITLES, usePageTitle } from '../../../lib/page-title';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.provider_token) {
        localStorage.setItem(GOOGLE_TOKEN_STORAGE_KEY, session.provider_token);
      }
      router.push(
        session
          ? resolvePostAuthPath(`?${searchParams.toString()}`)
          : ROUTES.LOGIN,
      );
    });
    return () => subscription.unsubscribe();
  }, [router, searchParams]);

  return <p>Signing you in...</p>;
}

export default function AuthCallbackPage() {
  usePageTitle(PAGE_TITLES.AUTH_CALLBACK);
  return (
    <Suspense fallback={<p>Signing you in...</p>}>
      <AuthCallbackContent />
    </Suspense>
  );
}
