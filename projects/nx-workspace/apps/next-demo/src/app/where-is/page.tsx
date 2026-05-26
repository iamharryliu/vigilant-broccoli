'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Flex, Text, TextField, Badge } from '@radix-ui/themes';
import { CRUDItemList } from '@vigilant-broccoli/react-lib';
import { FORM_TYPE } from '@vigilant-broccoli/common-js';
import { useAuth } from '../providers/auth-provider';
import { useHome } from '../providers/home-provider';
import { WhereIsItem } from '../../lib/types';
import { ROUTES } from '../../lib/routes';
import {
  WhereIsFormComponent,
  WhereIsFormValues,
  PreviewImage,
} from './where-is-form';

const DEFAULT_FORM: WhereIsFormValues = {
  id: '',
  title: '',
  description: '',
  tags: [],
  images: [],
};

const COPY = {
  LIST: { TITLE: 'Storage Areas', EMPTY_MESSAGE: 'No storage areas yet.' },
  [FORM_TYPE.CREATE]: {
    TITLE: 'Add Storage Area',
    DESCRIPTION: 'Upload photos of a storage area to identify its contents.',
  },
  [FORM_TYPE.UPDATE]: {
    TITLE: 'Update Storage Area',
    DESCRIPTION: 'Edit the title, description, and tags.',
  },
};

const fuzzyMatch = (query: string, item: WhereIsItem): boolean => {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  const searchText = [item.title, item.description, ...item.tags]
    .join(' ')
    .toLowerCase();
  return q.split(' ').every(word => searchText.includes(word));
};

const WhereIsListItem = ({ item }: { item: WhereIsFormValues }) => (
  <Box className="min-w-0">
    <Text weight="bold" size="2" as="p">{item.title}</Text>
    <Text size="1" color="gray" as="p">{item.description}</Text>
    <Flex wrap="wrap" gap="1" mt="1">
      {item.tags.map(tag => (
        <Badge key={tag} variant="soft" size="1">{tag}</Badge>
      ))}
    </Flex>
  </Box>
);

export default function WhereIsPage() {
  const router = useRouter();
  const session = useAuth();
  const { selectedHomeId } = useHome();
  const [items, setItems] = useState<WhereIsItem[]>([]);
  const [query, setQuery] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (selectedHomeId === null) return;
    setLoaded(false);
    fetch(`/api/where-is?homeId=${selectedHomeId}`, {
      headers: { Authorization: `Bearer ${session?.access_token ?? ''}` },
    })
      .then(r => r.json())
      .then(data => {
        setItems(data);
        setLoaded(true);
      });
  }, [selectedHomeId, session?.access_token]);

  const createItem = async (
    form: WhereIsFormValues,
  ): Promise<WhereIsFormValues> => {
    const { description, tags } = form;

    await fetch('/api/where-is', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title,
        description,
        tags,
        homeId: selectedHomeId,
        userId: session?.user.id,
        accessToken: session?.access_token,
        images: form.images.map(p => ({
          base64: p.base64,
          mimeType: p.mimeType,
        })),
      }),
    });

    const res = await fetch(`/api/where-is?homeId=${selectedHomeId}`, {
      headers: { Authorization: `Bearer ${session?.access_token ?? ''}` },
    });
    const updated: WhereIsItem[] = await res.json();
    const newItem = updated[0];

    return {
      id: newItem?.id ?? '',
      title: newItem?.title ?? form.title,
      description: newItem?.description ?? description,
      tags: newItem?.tags ?? tags,
      images: [],
      imageUrls: newItem?.imageUrls ?? [],
    } as WhereIsFormValues & Pick<WhereIsItem, 'imageUrls'>;
  };

  const updateItem = async (form: WhereIsFormValues): Promise<void> => {
    const original = items.find(i => i.id === form.id);
    const removedImageUrls = (original?.imageUrls ?? []).filter(
      url => !(form.imageUrls ?? []).includes(url),
    );
    await fetch('/api/where-is', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: form.id,
        title: form.title,
        description: form.description,
        tags: form.tags,
        removedImageUrls,
        newImages: form.images.map(p => ({
          base64: p.base64,
          mimeType: p.mimeType,
        })),
        accessToken: session?.access_token,
      }),
    });
  };

  const deleteItem = async (id: string | number) => {
    await fetch('/api/where-is', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, accessToken: session?.access_token }),
    });
  };

  if (selectedHomeId === null) return null;

  const filtered = items.filter(item => fuzzyMatch(query, item));

  const formItems = filtered.map(item => ({
    id: item.id,
    title: item.title,
    description: item.description,
    tags: item.tags,
    images: [] as PreviewImage[],
    imageUrls: item.imageUrls,
    createdAt: item.createdAt,
  }));

  return (
    <div className="max-w-5xl mx-auto p-2 sm:p-6 space-y-6">
      {loaded && (
        <>
          <TextField.Root
            placeholder="Search items (e.g. scissors, batteries)..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            size="3"
          />
          <CRUDItemList
            items={formItems as never}
            setItems={setItems as never}
            createItem={createItem as never}
            createItemFormDefaultValues={DEFAULT_FORM}
            updateItem={updateItem as never}
            deleteItem={deleteItem}
            FormComponent={WhereIsFormComponent as never}
            ListItemComponent={WhereIsListItem as never}
            copy={COPY}
            getItemImages={(item: { imageUrls?: string[] }) => item.imageUrls}
            getItemTitle={(item: { title: string }) => item.title}
            onItemClick={(item: { id: string }) =>
              router.push(ROUTES.WHERE_IS_DETAIL(item.id))
            }
          />
        </>
      )}
    </div>
  );
}
