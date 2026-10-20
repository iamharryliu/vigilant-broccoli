'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { getRuntimeConfig, getSupabase } from '../../../libs/supabase';
import {
  AUTHORIZATION_HEADER,
  BEARER_PREFIX,
  CONTENT_TYPE_HEADER,
  GOOGLE_TOKEN_HEADER,
  JSON_CONTENT_TYPE,
} from '@vigilant-broccoli/common-js';

const GOOGLE_TOKEN_KEY = 'google_provider_token';

interface AuthState {
  session: Session | null;
  isDemo: boolean;
}

const AuthContext = createContext<AuthState>({ session: null, isDemo: false });

export const useAuth = () => useContext(AuthContext);

export const getGoogleToken = () => localStorage.getItem(GOOGLE_TOKEN_KEY);

export const getSupabaseAccessToken = async () => {
  const { demo } = await getRuntimeConfig();
  if (demo) return null;
  const supabase = await getSupabase();
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
};

export const buildAuthHeaders = async (options?: {
  includeGoogleToken?: boolean;
  json?: boolean;
}): Promise<HeadersInit> => {
  const headers: Record<string, string> = {};
  const supabaseToken = await getSupabaseAccessToken();
  if (supabaseToken) {
    headers[AUTHORIZATION_HEADER] = `${BEARER_PREFIX}${supabaseToken}`;
  }
  if (options?.includeGoogleToken) {
    const googleToken = getGoogleToken();
    if (googleToken) headers[GOOGLE_TOKEN_HEADER] = googleToken;
  }
  if (options?.json) headers[CONTENT_TYPE_HEADER] = JSON_CONTENT_TYPE;
  return headers;
};

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [auth, setAuth] = useState<AuthState | undefined>(undefined);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    getRuntimeConfig().then(async ({ demo }) => {
      if (cancelled) return;
      if (demo) {
        setAuth({ session: null, isDemo: true });
        return;
      }

      const supabase = await getSupabase();
      if (cancelled) return;

      supabase.auth.getSession().then(({ data }) => {
        if (!cancelled) setAuth({ session: data.session, isDemo: false });
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.provider_token) {
          localStorage.setItem(GOOGLE_TOKEN_KEY, session.provider_token);
        }
        setAuth({ session, isDemo: false });
      });
      unsubscribe = () => subscription.unsubscribe();
    });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  if (auth === undefined) return null;

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}
