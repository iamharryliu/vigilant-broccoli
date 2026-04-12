'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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
  <Link href={`/homes/${item.id}`} className="block hover:opacity-70">
    <p className="font-medium">{item.name}</p>
    <p className="text-sm text-gray-500">{item.description}</p>
  </Link>
);

export default function HomesPage() {
  const session = useAuth();
  const [homes, setHomes] = useState<Home[]>([]);

  useEffect(() => {
    supabase
      .from('homes')
      .select('*')
      .then(({ data }) => {
        if (data) setHomes(data);
      });
  }, []);

  const createHome = async (home: Home): Promise<Home> => {
    const { data } = await supabase
      .from('homes')
      .insert({
        name: home.name,
        description: home.description,
        user_id: session?.user.id,
      })
      .select()
      .single();
    return data;
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
    <main className="mx-auto max-w-2xl p-8">
      <CRUDItemList
        items={homes}
        setItems={setHomes}
        createItem={createHome}
        createItemFormDefaultValues={DEFAULT_HOME}
        updateItem={updateHome}
        deleteItem={deleteHome}
        FormComponent={HomeFormComponent}
        ListItemComponent={HomeListItem}
        copy={COPY}
        isCards
      />
    </main>
  );
}
