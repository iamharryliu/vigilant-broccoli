'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../../libs/supabase';
import { GOOGLE_TOKEN_STORAGE_KEY } from '../hooks/use-google-token';

const AuthContext = createContext<Session | null | undefined>(undefined);

export const useAuth = () => useContext(AuthContext);

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
        localStorage.setItem(GOOGLE_TOKEN_STORAGE_KEY, session.provider_token);
      }
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Every consumer reads the access token out of this context, so a stale
  // snapshot 401s the whole app. supabase-js pauses its refresh timer while a
  // tab is hidden, so a tab left idle past the token's ~1h lifetime wakes up
  // holding a dead token. getSession refreshes an expired one, and re-running
  // it whenever the tab regains focus repairs the context before the user can
  // click anything.
  useEffect(() => {
    const refresh = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') refresh();
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', refresh);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  return (
    <AuthContext.Provider value={session}>{children}</AuthContext.Provider>
  );
}
