'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Badge, Flex, Text } from '@radix-ui/themes';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useAuth } from '../../providers/auth-provider';
import { PriceItem } from '../../../lib/types';
import { ROUTES } from '../../../lib/routes';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(
    price,
  );

const STORE_COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
  '#f97316',
  '#84cc16',
  '#ec4899',
  '#14b8a6',
];

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
    (a, b) =>
      new Date(a.purchasedAt).getTime() - new Date(b.purchasedAt).getTime(),
  );

  const stores = Array.from(
    new Set(item.entries.map(e => e.store ?? 'Unknown')),
  );

  const chartData = sortedEntries.reduce<Record<string, string | number>[]>(
    (acc, entry) => {
      const date = new Date(entry.purchasedAt).toLocaleDateString(undefined, {
        dateStyle: 'medium',
      });
      const store = entry.store ?? 'Unknown';
      const existing = acc.find(d => d.date === date);
      if (existing) {
        existing[store] = entry.price;
      } else {
        acc.push({ date, [store]: entry.price });
      }
      return acc;
    },
    [],
  );

  const prices = item.entries.map(e => e.price);
  const minPrice = prices.length ? Math.min(...prices) : null;
  const maxPrice = prices.length ? Math.max(...prices) : null;

  const priceHistoryEntries = [...item.entries].sort(
    (a, b) =>
      new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime(),
  );

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <Link
        href={ROUTES.PRICE_TRACKER}
        className="text-sm text-gray-500 hover:text-gray-700"
      >
        ← Back
      </Link>

      <div>
        <Flex align="center" gap="2" wrap="wrap" mb="1">
          <Text size="6" weight="bold">
            {item.name}
          </Text>
          {item.category && (
            <Badge variant="soft" color="blue" size="2">
              {item.category}
            </Badge>
          )}
          {item.unit && (
            <Badge variant="outline" size="2">
              {item.unit}
            </Badge>
          )}
        </Flex>
        {minPrice !== null && maxPrice !== null && prices.length > 1 && (
          <Text size="2" color="gray">
            Range: {formatPrice(minPrice)} – {formatPrice(maxPrice)} (
            {prices.length} entries)
          </Text>
        )}
      </div>

      {chartData.length > 1 && (
        <div>
          <Text size="3" weight="medium">
            Price Over Time
          </Text>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis
                  tickFormatter={v => `$${v}`}
                  tick={{ fontSize: 11 }}
                  width={48}
                />
                <Tooltip
                  formatter={value =>
                    typeof value === 'number' ? formatPrice(value) : value
                  }
                />
                {stores.length > 1 && <Legend />}
                {stores.map((store, i) => (
                  <Line
                    key={store}
                    type="monotone"
                    dataKey={store}
                    stroke={STORE_COLORS[i % STORE_COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Text size="3" weight="medium">
          Price History
        </Text>
        {priceHistoryEntries.length === 0 ? (
          <Text size="2" color="gray">
            No entries yet.
          </Text>
        ) : (
          <div className="flex flex-col gap-2">
            {priceHistoryEntries.map(entry => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white"
              >
                <div>
                  <Text size="2" weight="medium">
                    {formatPrice(entry.price)}
                  </Text>
                  {entry.store && (
                    <Text size="1" color="gray" as="p">
                      @ {entry.store}
                    </Text>
                  )}
                </div>
                <Text size="1" color="gray">
                  {new Date(entry.purchasedAt).toLocaleDateString(undefined, {
                    dateStyle: 'medium',
                  })}
                </Text>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
