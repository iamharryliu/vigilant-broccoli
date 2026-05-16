'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Badge, Button, Flex, Spinner, Text } from '@radix-ui/themes';
import { useAuth } from '../../providers/auth-provider';
import { WhereIsItem } from '../../../lib/types';
import { ROUTES } from '../../../lib/routes';

export default function WhereIsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const session = useAuth();
  const [item, setItem] = useState<WhereIsItem | null>(null);
  const [reanalyzing, setReanalyzing] = useState(false);

  useEffect(() => {
    if (!session?.access_token) return;
    fetch(`/api/where-is?id=${id}`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then(r => r.json())
      .then(setItem);
  }, [id, session?.access_token]);

  const handleReanalyze = async () => {
    if (!item || !session?.access_token) return;
    setReanalyzing(true);
    try {
      const res = await fetch('/api/where-is/reanalyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ id: item.id }),
      });
      if (!res.ok) return;
      const { description, tags } = await res.json();
      setItem(prev => prev ? { ...prev, description, tags } : prev);
    } finally {
      setReanalyzing(false);
    }
  };

  if (!item) return null;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <Link href={ROUTES.WHERE_IS} className="text-sm text-gray-500 hover:text-gray-700">
        ← Back
      </Link>

      <Flex align="center" justify="between">
        <Text size="6" weight="bold">{item.title}</Text>
        <Button variant="soft" onClick={handleReanalyze} disabled={reanalyzing}>
          {reanalyzing ? <Spinner /> : 'Re-analyze'}
        </Button>
      </Flex>

      {item.description && (
        <Text size="3" color="gray" as="p">{item.description}</Text>
      )}

      {item.tags.length > 0 && (
        <Flex gap="2" wrap="wrap">
          {item.tags.map(tag => (
            <Badge key={tag} variant="soft" size="2">{tag}</Badge>
          ))}
        </Flex>
      )}

      {item.imageUrls.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {item.imageUrls.map((url, i) => (
            <img
              key={i}
              src={url}
              alt={`${item.title} ${i + 1}`}
              className="w-full rounded-lg object-cover"
            />
          ))}
        </div>
      )}

      <Text size="1" color="gray" as="p">
        Added {new Date(item.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
      </Text>
    </div>
  );
}
