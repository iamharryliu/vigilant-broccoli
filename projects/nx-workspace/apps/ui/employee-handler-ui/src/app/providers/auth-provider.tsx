'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../../libs/supabase';
import {
  AUTHORIZATION_HEADER,
  BEARER_PREFIX,
  CONTENT_TYPE_HEADER,
  GOOGLE_TOKEN_HEADER,
  JSON_CONTENT_TYPE,
} from '@vigilant-broccoli/common-js';

const GOOGLE_TOKEN_KEY = 'google_provider_token';

const AuthContext = createContext<Session | null>(null);

export const useAuth = () => useContext(AuthContext);

export const getGoogleToken = () => localStorage.getItem(GOOGLE_TOKEN_KEY);

export const getSupabaseAccessToken = async () => {
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

export const signOutDueToExpiredToken = async () => {
  localStorage.removeItem(GOOGLE_TOKEN_KEY);
  await supabase.auth.signOut();
};

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.provider_token) {
        localStorage.setItem(GOOGLE_TOKEN_KEY, session.provider_token);
      }
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) return null;

  return (
    <AuthContext.Provider value={session}>{children}</AuthContext.Provider>
  );
}
