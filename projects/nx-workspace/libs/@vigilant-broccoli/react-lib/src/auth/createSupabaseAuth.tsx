'use client';

import { createClient, Session, SupabaseClient } from '@supabase/supabase-js';
import {
  createContext,
  createElement,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  AUTHORIZATION_HEADER,
  BEARER_PREFIX,
  CONTENT_TYPE_HEADER,
  GOOGLE_TOKEN_HEADER,
  JSON_CONTENT_TYPE,
} from '@vigilant-broccoli/common-js';
import {
  BuildAuthHeadersOptions,
  CreateSupabaseAuthOptions,
} from './auth.types';

const GOOGLE_TOKEN_STORAGE_KEY = 'google_provider_token';

const MISSING_PROVIDER_ERROR =
  'useAuth must be used within its matching AuthProvider';

export interface SupabaseAuth {
  AuthProvider: (props: { children: ReactNode }) => ReactNode;
  AuthCallbackPage: (props: { loadingLabel?: string }) => ReactNode;
  useAuth: () => Session | null;
  useAuthStatus: () => 'loading' | 'authenticated' | 'unauthenticated';
  useGoogleToken: () => {
    googleToken: string | null;
    clearGoogleToken: () => void;
  };
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  getSupabaseAccessToken: () => Promise<string | null>;
  buildAuthHeaders: (options?: BuildAuthHeadersOptions) => Promise<HeadersInit>;
  authFetch: (
    input: RequestInfo | URL,
    init?: RequestInit,
  ) => Promise<Response>;
}

export function createSupabaseAuth(
  options: CreateSupabaseAuthOptions,
): SupabaseAuth {
  const { supabaseUrl, supabaseKey, googleScopes, routes } = options;

  let _supabase: SupabaseClient | null = null;
  const getSupabase = (): SupabaseClient => {
    if (!_supabase) _supabase = createClient(supabaseUrl, supabaseKey);
    return _supabase;
  };
  const supabase = new Proxy({} as SupabaseClient, {
    get(_, prop) {
      return getSupabase()[prop as keyof SupabaseClient];
    },
  });

  const AuthContext = createContext<Session | null | undefined>(undefined);

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}${routes.callback}`,
        ...(googleScopes ? { scopes: googleScopes } : {}),
      },
    });
  };

  const signOut = async () => {
    localStorage.removeItem(GOOGLE_TOKEN_STORAGE_KEY);
    await supabase.auth.signOut();
  };

  const getSupabaseAccessToken = async (): Promise<string | null> => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  };

  const buildAuthHeaders = async (
    headerOptions?: BuildAuthHeadersOptions,
  ): Promise<HeadersInit> => {
    const headers: Record<string, string> = {};
    const accessToken = await getSupabaseAccessToken();
    if (accessToken)
      headers[AUTHORIZATION_HEADER] = `${BEARER_PREFIX}${accessToken}`;
    if (headerOptions?.includeGoogleToken) {
      const googleToken = localStorage.getItem(GOOGLE_TOKEN_STORAGE_KEY);
      if (googleToken) headers[GOOGLE_TOKEN_HEADER] = googleToken;
    }
    if (headerOptions?.json) headers[CONTENT_TYPE_HEADER] = JSON_CONTENT_TYPE;
    return headers;
  };

  const authFetch = async (
    input: RequestInfo | URL,
    init: RequestInit = {},
  ): Promise<Response> => {
    const hasJsonBody = typeof init.body === 'string';
    const authHeaders = await buildAuthHeaders({
      includeGoogleToken: true,
      json: hasJsonBody,
    });
    return fetch(input, {
      ...init,
      headers: { ...authHeaders, ...init.headers },
    });
  };

  const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [session, setSession] = useState<Session | null | undefined>(
      undefined,
    );

    useEffect(() => {
      supabase.auth.getSession().then(({ data }) => setSession(data.session));

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, nextSession) => {
        if (nextSession?.provider_token) {
          localStorage.setItem(
            GOOGLE_TOKEN_STORAGE_KEY,
            nextSession.provider_token,
          );
        }
        setSession(nextSession);
      });

      return () => subscription.unsubscribe();
    }, []);

    if (session === undefined) return null;

    return createElement(AuthContext.Provider, { value: session }, children);
  };

  const useAuth = (): Session | null => {
    const ctx = useContext(AuthContext);
    if (ctx === undefined) throw new Error(MISSING_PROVIDER_ERROR);
    return ctx;
  };

  const useAuthStatus = (): 'loading' | 'authenticated' | 'unauthenticated' => {
    const ctx = useContext(AuthContext);
    if (ctx === undefined) return 'loading';
    return ctx ? 'authenticated' : 'unauthenticated';
  };

  const useGoogleToken = () => {
    const [googleToken, setGoogleToken] = useState<string | null>(null);

    useEffect(() => {
      setGoogleToken(localStorage.getItem(GOOGLE_TOKEN_STORAGE_KEY));
    }, []);

    const clearGoogleToken = useCallback(() => {
      localStorage.removeItem(GOOGLE_TOKEN_STORAGE_KEY);
      setGoogleToken(null);
    }, []);

    return { googleToken, clearGoogleToken };
  };

  const AuthCallbackPage = ({ loadingLabel }: { loadingLabel?: string }) => {
    useEffect(() => {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.provider_token) {
          localStorage.setItem(
            GOOGLE_TOKEN_STORAGE_KEY,
            session.provider_token,
          );
        }
        const params = new URLSearchParams(window.location.search);
        const next = params.get('next');
        window.location.replace(session ? next || routes.home : routes.login);
      });
      return () => subscription.unsubscribe();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return createElement('p', null, loadingLabel ?? 'Signing you in...');
  };

  return {
    AuthProvider,
    AuthCallbackPage,
    useAuth,
    useAuthStatus,
    useGoogleToken,
    signInWithGoogle,
    signOut,
    getSupabaseAccessToken,
    buildAuthHeaders,
    authFetch,
  };
}
