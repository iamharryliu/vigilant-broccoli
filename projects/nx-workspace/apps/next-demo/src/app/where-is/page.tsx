'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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

const fuzzyMatch = (query: string, item: WhereIsItem): boolean => {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  const searchText = [item.title, item.description, ...item.tags]
    .join(' ')
    .toLowerCase();
  return q.split(' ').every(word => searchText.includes(word));
};

// eslint-disable-next-line complexity
export default function WhereIsPage() {
  const router = useRouter();
  const session = useAuth();
  const [homes, setHomes] = useState<HomeOption[]>([]);
  const [selectedHomeId, setSelectedHomeId] = useState<number | null>(null);
  const [loadingHomes, setLoadingHomes] = useState(true);
  const [items, setItems] = useState<WhereIsItem[]>([]);
  const [query, setQuery] = useState('');
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState<PreviewImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const fetchItems = useCallback(
    async (homeId: number) => {
      const res = await fetch(`/api/where-is?homeId=${homeId}`, {
        headers: { Authorization: `Bearer ${session?.access_token ?? ''}` },
      });
      setItems(await res.json());
    },
    [session?.access_token],
  );

  useEffect(() => {
    if (selectedHomeId !== null) fetchItems(selectedHomeId);
  }, [selectedHomeId, fetchItems]);

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

  const removePreview = (index: number) => {
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!previews.length || !title.trim() || selectedHomeId === null) return;
    setUploading(true);

    const analyzeRes = await fetch('/api/where-is/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        images: previews.map(p => ({ base64: p.base64, mimeType: p.mimeType })),
      }),
    });
    const { description, tags } = await analyzeRes.json();

    await fetch('/api/where-is', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: title.trim(),
        description,
        tags,
        homeId: selectedHomeId,
        userId: session?.user.id,
        accessToken: session?.access_token,
        images: previews.map(p => ({ base64: p.base64, mimeType: p.mimeType })),
      }),
    });

    setTitle('');
    setPreviews([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setUploading(false);
    fetchItems(selectedHomeId);
  };

  const handleDelete = async (id: string) => {
    await fetch('/api/where-is', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, accessToken: session?.access_token }),
    });
    if (selectedHomeId !== null) fetchItems(selectedHomeId);
  };

  if (loadingHomes) return <p className="p-6">Loading...</p>;

  const filtered = items.filter(item => fuzzyMatch(query, item));
  const selectedHome = homes.find(h => h.id === selectedHomeId);

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
          <div>
            <Text size="5" weight="bold">
              Add Storage Area
            </Text>
            <Flex direction="column" gap="3" mt="3">
              <TextField.Root
                placeholder="Title (e.g. Kitchen cabinet above sink)"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
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
                        onClick={() => removePreview(i)}
                        className="absolute top-0.5 right-0.5 bg-black/60 text-white border-none rounded-full w-5 h-5 cursor-pointer text-xs leading-5 text-center"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </Flex>
              )}
              <Button
                onClick={handleUpload}
                disabled={!previews.length || !title.trim() || uploading}
                className="cursor-pointer"
              >
                {uploading ? (
                  <>
                    <Spinner /> Analyzing...
                  </>
                ) : (
                  `Upload & Analyze${previews.length > 1 ? ` (${previews.length} images)` : ''}`
                )}
              </Button>
            </Flex>
          </div>

          <TextField.Root
            placeholder="Search items (e.g. scissors, batteries)..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            size="3"
          />

          {filtered.length === 0 && <Text color="gray">No results found.</Text>}

          <Flex direction="column" gap="2">
            {filtered.map(item => (
              <Flex key={item.id} gap="3" align="center">
                {item.imageUrls[0] && (
                  <img
                    src={item.imageUrls[0]}
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
                <Button
                  variant="ghost"
                  color="red"
                  size="1"
                  onClick={() => handleDelete(item.id)}
                  className="cursor-pointer shrink-0"
                >
                  ✕
                </Button>
              </Flex>
            ))}
          </Flex>
        </>
      )}
    </div>
  );
}
