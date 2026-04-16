'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../libs/supabase';
import { useAuth } from '../providers/auth-provider';
import { HomeCreateForm } from '../homes/components/HomeCreateForm';
import { HomeDetailView } from '../homes/components/HomeDetailView';

export default function HomePage() {
  const session = useAuth();
  const [homeId, setHomeId] = useState<number | null | undefined>(undefined);

  useEffect(() => {
    if (!session?.user.id) return;
    supabase
      .from('homes')
      .select('id')
      .eq('user_id', session.user.id)
      .limit(1)
      .maybeSingle()
      .then(async ({ data: owned }) => {
        if (owned) {
          setHomeId(owned.id);
          return;
        }
        const { data: membership } = await supabase
          .from('home_members')
          .select('home_id')
          .eq('user_id', session.user.id)
          .eq('status', 'accepted')
          .limit(1)
          .maybeSingle();
        setHomeId(membership?.home_id ?? null);
      });
  }, [session?.user.id]);

  const handleCreate = async (name: string, description: string) => {
    const { data } = await supabase
      .from('homes')
      .insert({ name, description, user_id: session?.user.id })
      .select('id')
      .single();
    if (data) setHomeId(data.id);
  };

  if (homeId === undefined) return null;

  return (
    <div className="max-w-2xl mx-auto p-6">
      {homeId === null ? (
        <HomeCreateForm onSubmit={handleCreate} />
      ) : (
        <HomeDetailView homeId={String(homeId)} />
      )}
    </div>
  );
}
