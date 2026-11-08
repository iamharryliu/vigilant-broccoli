'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { GoogleTasksAuthAdapter } from '@vigilant-broccoli/react-lib-higher-level';
import { supabase } from '../../../libs/supabase';
import { isAllowedEmail } from '../../../libs/auth-policy';
import {
  AUTHORIZATION_HEADER,
  BEARER_PREFIX,
  CONTENT_TYPE_HEADER,
  JSON_CONTENT_TYPE,
} from '@vigilant-broccoli/common-js';
import { API_ENDPOINTS } from '../constants/api-endpoints';

const OFFLINE_ACCESS_PARAMS = {
  access_type: 'offline',
  prompt: 'consent',
};
const GOOGLE_CALENDAR_TASKS_SCOPES =
  'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/tasks';

const AuthContext = createContext<Session | null>(null);

export const useAuth = () => useContext(AuthContext);

export const getSupabaseAccessToken = async () => {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
};

export const buildAuthHeaders = async (options?: {
  json?: boolean;
}): Promise<HeadersInit> => {
  const headers: Record<string, string> = {};
  const supabaseToken = await getSupabaseAccessToken();
  if (supabaseToken) {
    headers[AUTHORIZATION_HEADER] = `${BEARER_PREFIX}${supabaseToken}`;
  }
  if (options?.json) headers[CONTENT_TYPE_HEADER] = JSON_CONTENT_TYPE;
  return headers;
};

export const signOut = async () => {
  await supabase.auth.signOut();
};

export const signInWithGoogle = async () => {
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      scopes: GOOGLE_CALENDAR_TASKS_SCOPES,
      queryParams: OFFLINE_ACCESS_PARAMS,
    },
  });
};

export const reconnectGoogle = signInWithGoogle;

export const authFetch = async (
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> => {
  const hasJsonBody = typeof init.body === 'string';
  const headers = await buildAuthHeaders({ json: hasJsonBody });
  return fetch(input, { ...init, headers: { ...headers, ...init.headers } });
};

export const useAuthStatus = ():
  'loading' | 'authenticated' | 'unauthenticated' => {
  const session = useAuth();
  return session ? 'authenticated' : 'unauthenticated';
};

// Google access is resolved server-side from the stored refresh token, so the
// client holds no Google token; react-lib's adapter still expects this hook.
const SERVER_SIDE_GOOGLE_TOKEN = {
  googleToken: null,
  clearGoogleToken: () => undefined,
};

export const useGoogleToken = () => SERVER_SIDE_GOOGLE_TOKEN;

const persistGoogleRefreshToken = (session: Session) =>
  fetch(API_ENDPOINTS.GOOGLE_TOKEN, {
    method: 'POST',
    headers: {
      [CONTENT_TYPE_HEADER]: JSON_CONTENT_TYPE,
      [AUTHORIZATION_HEADER]: `${BEARER_PREFIX}${session.access_token}`,
    },
    body: JSON.stringify({ refreshToken: session.provider_refresh_token }),
  });

export const googleTasksAuth: GoogleTasksAuthAdapter = {
  authFetch,
  useAuthStatus,
  useGoogleToken,
  signInWithGoogle,
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
      // Not awaited: the callback must not block Supabase's auth state machine.
      if (
        session?.provider_refresh_token &&
        isAllowedEmail(session.user.email)
      ) {
        void persistGoogleRefreshToken(session);
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
