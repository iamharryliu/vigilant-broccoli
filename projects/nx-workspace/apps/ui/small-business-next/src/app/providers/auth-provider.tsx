'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../../libs/supabase';

const GOOGLE_TOKEN_KEY = 'google_provider_token';

const AuthContext = createContext<Session | null>(null);

export const useAuth = () => useContext(AuthContext);

export const getGoogleToken = () => localStorage.getItem(GOOGLE_TOKEN_KEY);

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
