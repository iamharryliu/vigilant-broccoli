'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Badge, Text } from '@radix-ui/themes';
import { useAuth } from '../../providers/auth-provider';
import { HomeDoc } from '../../../lib/types';
import { ROUTES } from '../../../lib/routes';

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

export default function DocDetailPage() {
  const { id } = useParams<{ id: string }>();
  const session = useAuth();
  const [doc, setDoc] = useState<HomeDoc | null>(null);

  useEffect(() => {
    if (!session?.access_token) return;
    fetch(`/api/docs?id=${id}`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then(r => r.json())
      .then(setDoc);
  }, [id, session?.access_token]);

  if (!doc) return null;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <Link href={ROUTES.DOCS} className="text-sm text-gray-500 hover:text-gray-700">
        ← Back
      </Link>

      <div className="flex items-center gap-3 flex-wrap">
        <Text size="6" weight="bold">{doc.name}</Text>
        <Badge variant="soft" size="2">{doc.category}</Badge>
      </div>

      {doc.description && (
        <Text size="3" color="gray" as="p">{doc.description}</Text>
      )}

      {doc.files.length > 0 && (
        <div className="space-y-2">
          <Text size="3" weight="medium">Files</Text>
          <div className="flex flex-col gap-2">
            {doc.files.map(f => (
              <a
                key={f.id}
                href={f.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-400 transition-colors"
              >
                <span className="text-2xl">{FILE_ICONS[f.mimeType] ?? '📎'}</span>
                <div className="flex-1 min-w-0">
                  <Text size="2" weight="medium" className="truncate block">{f.name}</Text>
                  <Text size="1" color="gray">{formatBytes(f.sizeBytes)}</Text>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      <Text size="1" color="gray" as="p">
        Added {new Date(doc.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
      </Text>
    </div>
  );
}
