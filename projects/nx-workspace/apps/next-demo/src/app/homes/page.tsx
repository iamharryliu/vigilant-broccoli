'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CRUDItemList, CRUDFormProps } from '@vigilant-broccoli/react-lib';
import { FORM_TYPE } from '@vigilant-broccoli/common-js';
import { Button } from '@radix-ui/themes';
import { supabase } from '../../../libs/supabase';
import { useAuth } from '../providers/auth-provider';
import { Home } from '../../lib/types';

const DEFAULT_HOME: Home = { id: 0, name: '', description: '' };

const COPY = {
  LIST: { TITLE: 'Homes', EMPTY_MESSAGE: 'No homes yet.' },
  [FORM_TYPE.CREATE]: { TITLE: 'Create Home', DESCRIPTION: 'Add a new home.' },
  [FORM_TYPE.UPDATE]: { TITLE: 'Update Home', DESCRIPTION: 'Edit this home.' },
};

const HomeFormComponent = ({
  formType,
  initialFormValues,
  submitHandler,
}: CRUDFormProps<Home>) => {
  const [home, setHome] = useState(initialFormValues);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await submitHandler(home, formType);
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-4 pt-2">
      <div className="space-y-1">
        <label className="text-sm font-medium">Name</label>
        <input
          className="w-full rounded border px-3 py-2"
          value={home.name}
          onChange={e => setHome(prev => ({ ...prev, name: e.target.value }))}
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium">Description</label>
        <input
          className="w-full rounded border px-3 py-2"
          value={home.description}
          onChange={e =>
            setHome(prev => ({ ...prev, description: e.target.value }))
          }
        />
      </div>
      <Button onClick={handleSubmit} loading={isSubmitting} className="w-full">
        Submit
      </Button>
    </div>
  );
};

const HomeListItem = ({ item }: { item: Home }) => (
  <div>
    <p className="font-medium">{item.name}</p>
    <p className="text-sm text-gray-500">{item.description}</p>
  </div>
);

export default function HomesPage() {
  const router = useRouter();
  const session = useAuth();
  const [ownedHomes, setOwnedHomes] = useState<Home[]>([]);
  const [memberHomes, setMemberHomes] = useState<Home[]>([]);

  useEffect(() => {
    supabase
      .from('homes')
      .select('id, name, description')
      .eq('user_id', session?.user.id ?? '')
      .then(({ data }) => {
        if (data) setOwnedHomes(data);
      });
    supabase
      .from('homes')
      .select('id, name, description')
      .neq('user_id', session?.user.id ?? '')
      .then(({ data }) => {
        if (data) setMemberHomes(data);
      });
  }, [session?.user.id]);

  const createHome = async (home: Home): Promise<Home> => {
    const { data } = await supabase
      .from('homes')
      .insert({
        name: home.name,
        description: home.description,
        user_id: session?.user.id,
      })
      .select('id, name, description')
      .single();
    return data ?? home;
  };

  const updateHome = async (home: Home): Promise<void> => {
    await supabase
      .from('homes')
      .update({ name: home.name, description: home.description })
      .eq('id', home.id);
  };

  const deleteHome = async (id: string | number): Promise<void> => {
    await supabase.from('homes').delete().eq('id', id);
  };

  return (
    <main className="mx-auto max-w-2xl p-8 space-y-8">
      <CRUDItemList
        items={ownedHomes}
        setItems={setOwnedHomes}
        createItem={createHome}
        createItemFormDefaultValues={DEFAULT_HOME}
        updateItem={updateHome}
        deleteItem={deleteHome}
        onItemClick={home => router.push(`/homes/${home.id}`)}
        FormComponent={HomeFormComponent}
        ListItemComponent={HomeListItem}
        copy={COPY}
        isCards
      />
      {memberHomes.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-500">Member of</p>
          {memberHomes.map(h => (
            <Link
              key={h.id}
              href={`/homes/${h.id}`}
              className="block rounded border p-3 hover:opacity-70"
            >
              <p className="font-medium">{h.name}</p>
              <p className="text-sm text-gray-500">{h.description}</p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
