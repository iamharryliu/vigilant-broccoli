'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../../libs/supabase';
import { isAllowedEmail } from '../../../libs/auth-policy';
import {
  AUTHORIZATION_HEADER,
  BEARER_PREFIX,
  CONTENT_TYPE_HEADER,
  GOOGLE_TOKEN_HEADER,
  JSON_CONTENT_TYPE,
} from '@vigilant-broccoli/common-js';

const GOOGLE_TOKEN_KEY = 'google_provider_token';
const GOOGLE_CALENDAR_TASKS_SCOPES =
  'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/tasks';

const AuthContext = createContext<Session | null>(null);

export const useAuth = () => useContext(AuthContext);

export const getGoogleToken = () => sessionStorage.getItem(GOOGLE_TOKEN_KEY);

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

export const signOut = async () => {
  sessionStorage.removeItem(GOOGLE_TOKEN_KEY);
  await supabase.auth.signOut();
};

export const signOutDueToExpiredToken = signOut;

export const signInWithGoogle = async () => {
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      scopes: GOOGLE_CALENDAR_TASKS_SCOPES,
    },
  });
};

export const authFetch = async (
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> => {
  const hasJsonBody = typeof init.body === 'string';
  const headers = await buildAuthHeaders({
    includeGoogleToken: true,
    json: hasJsonBody,
  });
  return fetch(input, { ...init, headers: { ...headers, ...init.headers } });
};

export const useAuthStatus = ():
  | 'loading'
  | 'authenticated'
  | 'unauthenticated' => {
  const session = useAuth();
  return session ? 'authenticated' : 'unauthenticated';
};

export const useGoogleToken = () => {
  const [googleToken, setGoogleToken] = useState<string | null>(null);

  useEffect(() => {
    setGoogleToken(getGoogleToken());
  }, []);

  const clearGoogleToken = useCallback(() => {
    sessionStorage.removeItem(GOOGLE_TOKEN_KEY);
    setGoogleToken(null);
  }, []);

  return { googleToken, clearGoogleToken };
};

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    const applySession = (next: Session | null) => {
      if (next && !isAllowedEmail(next.user.email)) {
        sessionStorage.removeItem(GOOGLE_TOKEN_KEY);
        supabase.auth.signOut();
        setSession(null);
        return;
      }
      setSession(next);
    };

    supabase.auth.getSession().then(({ data }) => applySession(data.session));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.provider_token) {
        sessionStorage.setItem(GOOGLE_TOKEN_KEY, session.provider_token);
      }
      applySession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) return null;

  return (
    <AuthContext.Provider value={session}>{children}</AuthContext.Provider>
  );
}
