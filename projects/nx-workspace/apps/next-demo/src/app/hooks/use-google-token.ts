'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../libs/supabase';
import { ROUTES } from '../../lib/routes';

export const GOOGLE_TOKEN_STORAGE_KEY = 'google_provider_token';

export function useGoogleToken() {
  const [googleToken, setGoogleToken] = useState<string | null>(null);

  useEffect(() => {
    setGoogleToken(localStorage.getItem(GOOGLE_TOKEN_STORAGE_KEY));
  }, []);

  const clearGoogleToken = useCallback(() => {
    localStorage.removeItem(GOOGLE_TOKEN_STORAGE_KEY);
    setGoogleToken(null);
  }, []);

  const requestGoogleAuth = useCallback(() => {
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}${ROUTES.AUTH_CALLBACK}?next=${ROUTES.TASKS}`,
        scopes: 'https://www.googleapis.com/auth/tasks',
      },
    });
  }, []);

  return { googleToken, clearGoogleToken, requestGoogleAuth };
}
