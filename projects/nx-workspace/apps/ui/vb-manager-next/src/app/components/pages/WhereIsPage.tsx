'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Button,
  Flex,
  Text,
  TextField,
  Badge,
  Spinner,
} from '@radix-ui/themes';

interface WhereIsItem {
  id: string;
  title: string;
  description: string;
  tags: string[];
  imageUrls: string[];
  createdAt: string;
}

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

export const WhereIsPage = () => {
  const [items, setItems] = useState<WhereIsItem[]>([]);
  const [query, setQuery] = useState('');
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState<PreviewImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchItems = useCallback(async () => {
    const res = await fetch('/api/where-is');
    setItems(await res.json());
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

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
    if (!previews.length || !title.trim()) return;
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
        id: crypto.randomUUID(),
        title: title.trim(),
        description,
        tags,
        images: previews.map(p => ({ base64: p.base64, mimeType: p.mimeType })),
      }),
    });

    setTitle('');
    setPreviews([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setUploading(false);
    fetchItems();
  };

  const handleDelete = async (id: string) => {
    await fetch('/api/where-is', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchItems();
  };

  const filtered = items.filter(item => fuzzyMatch(query, item));

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
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
            style={{ fontSize: '14px' }}
          />
          {previews.length > 0 && (
            <Flex gap="2" wrap="wrap">
              {previews.map((p, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <img
                    src={p.dataUrl}
                    alt={`preview ${i + 1}`}
                    style={{
                      height: '100px',
                      width: '100px',
                      objectFit: 'cover',
                      borderRadius: '6px',
                    }}
                  />
                  <button
                    onClick={() => removePreview(i)}
                    style={{
                      position: 'absolute',
                      top: '2px',
                      right: '2px',
                      background: 'rgba(0,0,0,0.6)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      lineHeight: '20px',
                      textAlign: 'center',
                    }}
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
            style={{ cursor: 'pointer' }}
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
            <img
              src={item.imageUrls[0]}
              alt={item.title}
              style={{
                width: '64px',
                height: '64px',
                objectFit: 'cover',
                borderRadius: '4px',
                flexShrink: 0,
              }}
            />
            <Box style={{ flex: 1, minWidth: 0 }}>
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
              style={{ cursor: 'pointer', flexShrink: 0 }}
            >
              ✕
            </Button>
          </Flex>
        ))}
      </Flex>
    </div>
  );
};
