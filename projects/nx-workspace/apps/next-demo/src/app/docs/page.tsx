'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge, Button, Dialog, Flex, Text, TextField } from '@radix-ui/themes';
import { supabase } from '../../../libs/supabase';
import { useAuth } from '../providers/auth-provider';
import { ROUTES } from '../../lib/routes';
import { DOC_CATEGORIES, DocCategory, HomeDoc } from '../../lib/types';
import { HomeDocForm, HomeDocFormData } from './components/HomeDocForm';

const CATEGORY_COLORS: Record<DocCategory, string> = {
  Insurance: 'blue',
  Warranty: 'green',
  Manual: 'gray',
  Contract: 'orange',
  Receipt: 'yellow',
  Permit: 'red',
  Photo: 'pink',
  Other: 'gray',
};

const FILE_ICONS: Record<string, string> = {
  'application/pdf': '📄',
  'image/jpeg': '🖼️',
  'image/png': '🖼️',
  'image/webp': '🖼️',
};

const formatBytes = (bytes: number) => {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

type ModalState = { type: 'create' } | { type: 'edit'; doc: HomeDoc } | null;

export default function DocsPage() {
  const router = useRouter();
  const session = useAuth();
  const [homeId, setHomeId] = useState<number | null>(null);
  const [docs, setDocs] = useState<HomeDoc[]>([]);
  const [modal, setModal] = useState<ModalState>(null);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<DocCategory | 'All'>(
    'All',
  );
  const [loaded, setLoaded] = useState(false);

  const token = session?.access_token ?? '';
  const authHeader = (extra?: Record<string, string>) => ({
    Authorization: `Bearer ${token}`,
    ...extra,
  });

  useEffect(() => {
    supabase
      .from('homes')
      .select('id')
      .order('created_at', { ascending: true })
      .limit(1)
      .single()
      .then(({ data }) => {
        if (!data) {
          router.replace(ROUTES.HOMES);
          return;
        }
        setHomeId(data.id);
      });
  }, [router]);

  const fetchDocs = useCallback(async () => {
    if (!homeId || !token) return;
    const res = await fetch(`/api/docs?homeId=${homeId}`, {
      headers: authHeader(),
    });
    const data = await res.json();
    setDocs(Array.isArray(data) ? data : []);
    setLoaded(true);
  }, [homeId, token]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  const handleCreate = async (data: HomeDocFormData) => {
    await fetch('/api/docs', {
      method: 'POST',
      headers: authHeader({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ ...data, homeId }),
    });
    setModal(null);
    fetchDocs();
  };

  const handleEdit = async (data: HomeDocFormData) => {
    if (modal?.type !== 'edit') return;
    await fetch('/api/docs', {
      method: 'PATCH',
      headers: authHeader({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        id: modal.doc.id,
        name: data.name,
        description: data.description,
        category: data.category,
      }),
    });
    setModal(null);
    fetchDocs();
  };

  const handleDelete = async () => {
    if (modal?.type !== 'edit') return;
    await fetch('/api/docs', {
      method: 'DELETE',
      headers: authHeader({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ id: modal.doc.id }),
    });
    setModal(null);
    fetchDocs();
  };

  if (!homeId) return null;

  const filtered = docs.filter(doc => {
    const matchesQuery =
      !query.trim() ||
      [doc.name, doc.description ?? '', doc.category]
        .join(' ')
        .toLowerCase()
        .includes(query.toLowerCase());
    const matchesCategory =
      categoryFilter === 'All' || doc.category === categoryFilter;
    return matchesQuery && matchesCategory;
  });

  return (
    <div className="max-w-4xl mx-auto p-2 sm:p-6 space-y-6">
      <Flex justify="between" align="center" wrap="wrap" gap="3">
        <Text size="6" weight="bold">
          Home Documents
        </Text>
        <Button
          onClick={() => setModal({ type: 'create' })}
          className="cursor-pointer"
        >
          + Add Document
        </Button>
      </Flex>

      <Flex gap="2" wrap="wrap">
        <TextField.Root
          placeholder="Search documents..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="flex-1 min-w-48"
        />
        <div className="flex gap-1 flex-wrap">
          {(['All', ...DOC_CATEGORIES] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-full text-sm border transition-colors cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </Flex>

      {loaded && filtered.length === 0 && (
        <Text color="gray" size="2">
          No documents found.
        </Text>
      )}

      <div className="flex flex-col gap-3">
        {filtered.map(doc => (
          <div
            key={doc.id}
            className="p-4 rounded-lg border border-gray-200 bg-white hover:border-gray-300 transition-colors"
          >
            <Flex justify="between" align="start" gap="3">
              <div className="flex-1 min-w-0">
                <Flex align="center" gap="2" wrap="wrap" mb="1">
                  <Text weight="bold" size="3">
                    {doc.name}
                  </Text>
                  <Badge
                    color={CATEGORY_COLORS[doc.category] as never}
                    variant="soft"
                    size="1"
                  >
                    {doc.category}
                  </Badge>
                </Flex>
                {doc.description && (
                  <Text size="2" color="gray" as="p" mb="2">
                    {doc.description}
                  </Text>
                )}
                {doc.files.length > 0 && (
                  <Flex gap="2" wrap="wrap">
                    {doc.files.map(f => (
                      <a
                        key={f.id}
                        href={f.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-2 py-1 rounded border border-gray-200 hover:border-gray-400 text-sm text-gray-700 transition-colors"
                      >
                        <span>{FILE_ICONS[f.mimeType] ?? '📎'}</span>
                        <span className="max-w-32 truncate">{f.name}</span>
                        <span className="text-gray-400 text-xs">
                          ({formatBytes(f.sizeBytes)})
                        </span>
                      </a>
                    ))}
                  </Flex>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => setModal({ type: 'edit', doc })}
                  className="text-gray-400 hover:text-gray-600 text-sm cursor-pointer"
                >
                  Edit
                </button>
              </div>
            </Flex>
          </div>
        ))}
      </div>

      {/* Create */}
      <Dialog.Root
        open={modal?.type === 'create'}
        onOpenChange={open => {
          if (!open) setModal(null);
        }}
      >
        <Dialog.Content style={{ maxWidth: 500 }}>
          <Dialog.Title>Add Document</Dialog.Title>
          <HomeDocForm
            onSubmit={handleCreate}
            onCancel={() => setModal(null)}
          />
        </Dialog.Content>
      </Dialog.Root>

      {/* Edit */}
      <Dialog.Root
        open={modal?.type === 'edit'}
        onOpenChange={open => {
          if (!open) setModal(null);
        }}
      >
        <Dialog.Content style={{ maxWidth: 500 }}>
          <Dialog.Title>Edit Document</Dialog.Title>
          {modal?.type === 'edit' && (
            <HomeDocForm
              initialData={{
                name: modal.doc.name,
                description: modal.doc.description ?? '',
                category: modal.doc.category,
              }}
              onSubmit={handleEdit}
              onDelete={handleDelete}
              onCancel={() => setModal(null)}
              isEdit
            />
          )}
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
}
