'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Badge, Flex, Text } from '@radix-ui/themes';
import { useAuth } from '../../providers/auth-provider';
import { PriceItem } from '../../../lib/types';
import { ROUTES } from '../../../lib/routes';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(price);

export default function PriceTrackerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const session = useAuth();
  const [item, setItem] = useState<PriceItem | null>(null);

  useEffect(() => {
    if (!session?.access_token) return;
    fetch(`/api/price-tracker?id=${id}`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then(r => r.json())
      .then(setItem);
  }, [id, session?.access_token]);

  if (!item) return null;

  const sortedEntries = [...item.entries].sort(
    (a, b) => new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime(),
  );
  const prices = item.entries.map(e => e.price);
  const minPrice = prices.length ? Math.min(...prices) : null;
  const maxPrice = prices.length ? Math.max(...prices) : null;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <Link href={ROUTES.PRICE_TRACKER} className="text-sm text-gray-500 hover:text-gray-700">
        ← Back
      </Link>

      <div>
        <Flex align="center" gap="2" wrap="wrap" mb="1">
          <Text size="6" weight="bold">{item.name}</Text>
          {item.category && <Badge variant="soft" color="blue" size="2">{item.category}</Badge>}
          {item.unit && <Badge variant="outline" size="2">{item.unit}</Badge>}
        </Flex>
        {minPrice !== null && maxPrice !== null && prices.length > 1 && (
          <Text size="2" color="gray">
            Range: {formatPrice(minPrice)} – {formatPrice(maxPrice)} ({prices.length} entries)
          </Text>
        )}
      </div>

      <div className="space-y-2">
        <Text size="3" weight="medium">Price History</Text>
        {sortedEntries.length === 0 ? (
          <Text size="2" color="gray">No entries yet.</Text>
        ) : (
          <div className="flex flex-col gap-2">
            {sortedEntries.map(entry => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white"
              >
                <div>
                  <Text size="2" weight="medium">{formatPrice(entry.price)}</Text>
                  {entry.store && (
                    <Text size="1" color="gray" as="p">@ {entry.store}</Text>
                  )}
                </div>
                <Text size="1" color="gray">
                  {new Date(entry.purchasedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                </Text>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
