'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { supabase } from '../../../libs/supabase';
import { useAuth } from './auth-provider';
import { Home } from '../../lib/types';

const SELECTED_HOME_KEY = 'hearth:selected-home-id';

type HomeContextValue = {
  homes: Home[];
  selectedHomeId: number | null;
  setSelectedHomeId: (id: number) => void;
  refreshHomes: () => Promise<void>;
};

const HomeContext = createContext<HomeContextValue>({
  homes: [],
  selectedHomeId: null,
  setSelectedHomeId: (_id: number) => undefined,
  refreshHomes: async () => undefined,
});

export const useHome = () => useContext(HomeContext);

const readStoredHomeId = () => {
  const stored = Number(window.localStorage.getItem(SELECTED_HOME_KEY));
  return Number.isFinite(stored) && stored > 0 ? stored : null;
};

export default function HomeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = useAuth();
  const [homes, setHomes] = useState<Home[]>([]);
  const [selectedHomeId, setSelectedHomeIdState] = useState<number | null>(
    null,
  );

  const setSelectedHomeId = useCallback((id: number) => {
    setSelectedHomeIdState(id);
    window.localStorage.setItem(SELECTED_HOME_KEY, String(id));
  }, []);

  const refreshHomes = useCallback(async () => {
    if (!session?.user.id) return;

    const [{ data: owned }, { data: memberships }] = await Promise.all([
      supabase
        .from('homes')
        .select('id, name, description')
        .eq('user_id', session.user.id),
      supabase
        .from('home_members')
        .select('home_id, homes(id, name, description)')
        .eq('user_id', session.user.id)
        .eq('status', 'accepted'),
    ]);

    const ownedHomes: Home[] = (owned ?? []).map(home => ({
      ...home,
      isOwner: true,
    }));

    const memberHomes: Home[] = (memberships ?? [])
      .map(m => m.homes as unknown as Home)
      .filter(Boolean)
      .filter(mh => !ownedHomes.some(o => o.id === mh.id))
      .map(home => ({ ...home, isOwner: false }));

    const all = [...ownedHomes, ...memberHomes];
    setHomes(all);

    // Keeps the active home across reloads and session refreshes. Falls back to
    // the first home only when the stored one is gone (deleted, or access
    // revoked), so a refresh no longer silently snaps back to the first home.
    setSelectedHomeIdState(current => {
      if (current && all.some(h => h.id === current)) return current;
      const stored = readStoredHomeId();
      if (stored && all.some(h => h.id === stored)) return stored;
      return all[0]?.id ?? null;
    });
  }, [session?.user.id]);

  useEffect(() => {
    refreshHomes();
  }, [refreshHomes]);

  return (
    <HomeContext.Provider
      value={{ homes, selectedHomeId, setSelectedHomeId, refreshHomes }}
    >
      {children}
    </HomeContext.Provider>
  );
}
