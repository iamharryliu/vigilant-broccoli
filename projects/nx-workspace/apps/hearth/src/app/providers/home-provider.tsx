'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../../libs/supabase';
import { useAuth } from './auth-provider';
import { Home } from '../../lib/types';

type HomeContextValue = {
  homes: Home[];
  selectedHomeId: number | null;
  setSelectedHomeId: (id: number) => void;
};

const HomeContext = createContext<HomeContextValue>({
  homes: [],
  selectedHomeId: null,
  setSelectedHomeId: (_id: number) => undefined,
});

export const useHome = () => useContext(HomeContext);

export default function HomeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = useAuth();
  const [homes, setHomes] = useState<Home[]>([]);
  const [selectedHomeId, setSelectedHomeId] = useState<number | null>(null);

  useEffect(() => {
    if (!session?.user.id) return;

    const fetchHomes = async () => {
      const { data: owned } = await supabase
        .from('homes')
        .select('id, name, description')
        .eq('user_id', session.user.id);

      const { data: memberships } = await supabase
        .from('home_members')
        .select('home_id, homes(id, name, description)')
        .eq('user_id', session.user.id)
        .eq('status', 'accepted');

      const memberHomes = (memberships ?? [])
        .map(m => m.homes as unknown as Home)
        .filter(Boolean);

      const all: Home[] = [
        ...(owned ?? []),
        ...memberHomes.filter(mh => !(owned ?? []).some(o => o.id === mh.id)),
      ];

      setHomes(all);
      if (all.length > 0) setSelectedHomeId(all[0].id);
    };

    fetchHomes();
  }, [session?.user.id]);

  return (
    <HomeContext.Provider value={{ homes, selectedHomeId, setSelectedHomeId }}>
      {children}
    </HomeContext.Provider>
  );
}
