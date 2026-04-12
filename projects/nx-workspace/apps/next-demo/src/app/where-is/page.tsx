'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Flex,
  Text,
  TextField,
  Badge,
  Spinner,
  Select,
} from '@radix-ui/themes';
import { CRUDItemList, CRUDFormProps } from '@vigilant-broccoli/react-lib';
import { FORM_TYPE } from '@vigilant-broccoli/common-js';
import { supabase } from '../../../libs/supabase';
import { useAuth } from '../providers/auth-provider';
import { ROUTES } from '../../lib/routes';
import { WhereIsItem } from '../../lib/types';

type HomeOption = { id: number; name: string };

interface PreviewImage {
  base64: string;
  mimeType: string;
  dataUrl: string;
}

type WhereIsFormValues = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  images: PreviewImage[];
};

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

const WhereIsListItem = ({ item }: { item: WhereIsFormValues & Pick<WhereIsItem, 'imageUrls'> }) => (
  <Flex gap="3" align="center">
    {item.imageUrls?.[0] && (
      <img
        src={item.imageUrls?.[0]}
        alt={item.title}
        className="w-16 h-16 object-cover rounded shrink-0"
      />
    )}
    <Box className="flex-1 min-w-0">
      <Text weight="bold" size="2">
        {item.title}
      </Text>
      <Text size="1" color="gray" as="p">
        {item.description}
      </Text>
      <Flex wrap="wrap" gap="1" mt="1">
        {item.tags.map(tag => (
          <Badge key={tag} variant="soft" size="1">
            {tag}
          </Badge>
        ))}
      </Flex>
    </Box>
  </Flex>
);

const WhereIsFormComponent = ({
  formType,
  initialFormValues,
  submitHandler,
}: CRUDFormProps<WhereIsFormValues>) => {
  const [title, setTitle] = useState(initialFormValues.title);
  const [description, setDescription] = useState(initialFormValues.description);
  const [tags, setTags] = useState<string[]>(initialFormValues.tags);
  const [tagInput, setTagInput] = useState('');
  const [previews, setPreviews] = useState<PreviewImage[]>(
    initialFormValues.images,
  );
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isUpdate = formType === FORM_TYPE.UPDATE;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    Promise.all(
      files.map(
        file =>
          new Promise<PreviewImage>(resolve => {
            const reader = new FileReader();
            reader.onload = ev => {
              const dataUrl = ev.target?.result as string;
              resolve({
                base64: dataUrl.split(',')[1],
                mimeType: file.type,
                dataUrl,
              });
            };
            reader.readAsDataURL(file);
          }),
      ),
    ).then(newPreviews => setPreviews(prev => [...prev, ...newPreviews]));
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags(prev => [...prev, t]);
    setTagInput('');
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    if (!isUpdate && !previews.length) return;
    setSubmitting(true);
    await submitHandler(
      { ...initialFormValues, title, description, tags, images: previews },
      formType,
    );
    setSubmitting(false);
  };

  return (
    <Flex direction="column" gap="3" mt="3">
      <div>
        <Text size="1" weight="medium" as="p" mb="1">
          Title
        </Text>
        <TextField.Root
          placeholder="e.g. Kitchen cabinet above sink"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
      </div>
      <div>
        <Text size="1" weight="medium" as="p" mb="1">
          Description
        </Text>
        <TextField.Root
          placeholder="Brief description of contents"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </div>

      <div>
        <Text size="1" weight="medium" as="p" mb="1">
          Tags
        </Text>
        <Flex gap="2">
          <TextField.Root
            placeholder="Add tag..."
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            className="flex-1"
          />
          <Button
            variant="soft"
            size="2"
            onClick={addTag}
            className="cursor-pointer"
          >
            Add
          </Button>
        </Flex>
        <Flex gap="2" mt="2" wrap="wrap">
          {tags.map(tag => (
            <Badge
              key={tag}
              variant="soft"
              size="1"
              className="cursor-pointer"
              onClick={() => setTags(prev => prev.filter(t => t !== tag))}
            >
              {tag} ✕
            </Badge>
          ))}
        </Flex>
      </div>

      {!isUpdate && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="text-sm"
          />
          {previews.length > 0 && (
            <Flex gap="2" wrap="wrap">
              {previews.map((p, i) => (
                <div key={i} className="relative">
                  <img
                    src={p.dataUrl}
                    alt={`preview ${i + 1}`}
                    className="h-24 w-24 object-cover rounded"
                  />
                  <button
                    onClick={() =>
                      setPreviews(prev => prev.filter((_, j) => j !== i))
                    }
                    className="absolute top-0.5 right-0.5 bg-black/60 text-white border-none rounded-full w-5 h-5 cursor-pointer text-xs leading-5 text-center"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </Flex>
          )}
        </>
      )}

      <Button
        onClick={handleSubmit}
        disabled={
          !title.trim() || (!isUpdate && !previews.length) || submitting
        }
        className="cursor-pointer"
      >
        {submitting ? (
          <>
            <Spinner /> {isUpdate ? 'Saving...' : 'Analyzing...'}
          </>
        ) : isUpdate ? (
          'Save'
        ) : (
          `Upload & Analyze${previews.length > 1 ? ` (${previews.length} images)` : ''}`
        )}
      </Button>
    </Flex>
  );
};

export default function WhereIsPage() {
  const router = useRouter();
  const session = useAuth();
  const [homes, setHomes] = useState<HomeOption[]>([]);
  const [selectedHomeId, setSelectedHomeId] = useState<number | null>(null);
  const [loadingHomes, setLoadingHomes] = useState(true);
  const [items, setItems] = useState<WhereIsItem[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    supabase
      .from('homes')
      .select('id, name')
      .then(({ data }) => {
        const userHomes = data ?? [];
        if (userHomes.length === 0) {
          router.replace(ROUTES.HOMES);
          return;
        }
        setHomes(userHomes);
        setSelectedHomeId(userHomes.length === 1 ? userHomes[0].id : null);
        setLoadingHomes(false);
      });
  }, [router]);

  useEffect(() => {
    if (selectedHomeId === null) return;
    fetch(`/api/where-is?homeId=${selectedHomeId}`, {
      headers: { Authorization: `Bearer ${session?.access_token ?? ''}` },
    })
      .then(r => r.json())
      .then(setItems);
  }, [selectedHomeId, session?.access_token]);

  const createItem = async (
    form: WhereIsFormValues,
  ): Promise<WhereIsFormValues> => {
    const analyzeRes = await fetch('/api/where-is/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        images: form.images.map(p => ({
          base64: p.base64,
          mimeType: p.mimeType,
        })),
      }),
    });
    const { description, tags } = await analyzeRes.json();

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
    await fetch('/api/where-is', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: form.id,
        title: form.title,
        description: form.description,
        tags: form.tags,
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

  if (loadingHomes) return <p className="p-6">Loading...</p>;

  const selectedHome = homes.find(h => h.id === selectedHomeId);
  const filtered = items.filter(item => fuzzyMatch(query, item));

  // Map WhereIsItem to WhereIsFormValues shape for CRUDItemList
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
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <Flex justify="between" align="center">
        <Text size="6" weight="bold">
          Where Is
        </Text>
        {homes.length > 1 && (
          <Select.Root
            value={selectedHomeId?.toString() ?? ''}
            onValueChange={v => setSelectedHomeId(Number(v))}
          >
            <Select.Trigger placeholder="Select a home" />
            <Select.Content>
              {homes.map(h => (
                <Select.Item key={h.id} value={h.id.toString()}>
                  {h.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        )}
        {homes.length === 1 && selectedHome && (
          <Text size="2" color="gray">
            {selectedHome.name}
          </Text>
        )}
      </Flex>

      {selectedHomeId === null ? (
        <Text color="gray">Select a home to view storage areas.</Text>
      ) : (
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
          />
        </>
      )}
    </div>
  );
}
