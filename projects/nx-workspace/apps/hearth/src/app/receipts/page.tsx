'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Store, Trash2 } from 'lucide-react';
import { Badge, Button, Input, Text } from '@vigilant-broccoli/react-lib';
import {
  CONTENT_TYPE_HEADER,
  HTTP_METHOD,
  JSON_CONTENT_TYPE,
} from '@vigilant-broccoli/common-js';
import { useAuth } from '../providers/auth-provider';
import { useHome } from '../providers/home-provider';
import { useAuthHeader } from '../hooks/use-auth-headers';
import { Receipt } from '../../lib/types';
import { ROUTES } from '../../lib/routes';
import { PAGE_TITLES, usePageTitle } from '../../lib/page-title';
import ReceiptScanner from './ReceiptScanner';
import {
  formatDate,
  formatPrice,
  itemCount,
  receiptTotal,
  RECEIPTS_API,
} from './receipt-utils';

const TAB = { RECEIPTS: 'receipts', ITEMS: 'items' } as const;

type Tab = (typeof TAB)[keyof typeof TAB];

const ALL_MERCHANTS = '';

const ReceiptRow = ({
  receipt,
  onOpen,
  onDelete,
}: {
  receipt: Receipt;
  onOpen: () => void;
  onDelete: () => void;
}) => (
  <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-400 transition-colors">
    <button
      onClick={onOpen}
      className="flex-1 min-w-0 text-left bg-transparent border-none cursor-pointer p-0"
    >
      <div className="flex items-center gap-2 flex-wrap">
        <Text weight="bold" size="2">
          {receipt.merchantName ?? 'Unknown company'}
        </Text>
        <Badge variant="soft" size="1" color="blue">
          {receipt.items.length} items
        </Badge>
        {receipt.imageKeys.length > 0 && (
          <Badge variant="outline" size="1">
            scanned
          </Badge>
        )}
      </div>
      <Text size="1" color="gray" as="p">
        {formatDate(receipt.purchasedAt)} · {itemCount(receipt.items)} units
      </Text>
    </button>
    <Text size="3" weight="bold">
      {formatPrice(receiptTotal(receipt), receipt.currency)}
    </Text>
    <button
      onClick={onDelete}
      className="shrink-0 h-8 w-8 flex items-center justify-center rounded border border-gray-200 dark:border-gray-700 bg-transparent text-gray-500 hover:text-red-500 cursor-pointer"
      aria-label={`Delete receipt from ${receipt.merchantName ?? 'unknown company'}`}
    >
      <Trash2 size={15} />
    </button>
  </div>
);

export default function ReceiptsPage() {
  usePageTitle(PAGE_TITLES.RECEIPTS);
  const router = useRouter();
  const session = useAuth();
  const { selectedHomeId } = useHome();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [query, setQuery] = useState('');
  const [merchantFilter, setMerchantFilter] = useState<string>(ALL_MERCHANTS);
  const [tab, setTab] = useState<Tab>(TAB.RECEIPTS);
  const [scanning, setScanning] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const accessToken = session?.access_token;
  const authHeader = useAuthHeader();

  const load = useCallback(async () => {
    if (!selectedHomeId || !accessToken) return;
    const res = await fetch(`${RECEIPTS_API.BASE}?homeId=${selectedHomeId}`, {
      headers: await authHeader(),
    });
    const data = await res.json();
    setReceipts(Array.isArray(data) ? data : []);
    setLoaded(true);
  }, [selectedHomeId, accessToken, authHeader]);

  useEffect(() => {
    setLoaded(false);
    load();
  }, [load]);

  const deleteReceipt = async (id: string) => {
    setReceipts(prev => prev.filter(r => r.id !== id));
    await fetch(RECEIPTS_API.BASE, {
      method: HTTP_METHOD.DELETE,
      headers: {
        ...(await authHeader()),
        [CONTENT_TYPE_HEADER]: JSON_CONTENT_TYPE,
      },
      body: JSON.stringify({ id }),
    });
  };

  const merchants = useMemo(
    () =>
      Array.from(
        new Set(receipts.map(r => r.merchantName).filter(Boolean) as string[]),
      ).sort(),
    [receipts],
  );

  const filteredReceipts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return receipts.filter(receipt => {
      if (merchantFilter && receipt.merchantName !== merchantFilter)
        return false;
      if (!q) return true;
      return [
        receipt.merchantName ?? '',
        receipt.notes ?? '',
        ...receipt.items.map(i => `${i.name} ${i.category ?? ''}`),
      ]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [receipts, query, merchantFilter]);

  // Flattened line items across every receipt — the "what did we buy, when,
  // and where" history view.
  const itemHistory = useMemo(() => {
    const q = query.trim().toLowerCase();
    return receipts
      .flatMap(receipt =>
        receipt.items.map(item => ({
          ...item,
          receiptId: receipt.id,
          merchantName: receipt.merchantName,
          purchasedAt: receipt.purchasedAt,
          currency: receipt.currency,
        })),
      )
      .filter(item => {
        if (merchantFilter && item.merchantName !== merchantFilter)
          return false;
        if (!q) return true;
        return `${item.name} ${item.category ?? ''} ${item.merchantName ?? ''}`
          .toLowerCase()
          .includes(q);
      })
      .sort((a, b) => b.purchasedAt.localeCompare(a.purchasedAt));
  }, [receipts, query, merchantFilter]);

  if (!selectedHomeId) return null;

  // Summing across currencies would be meaningless, so the running total is
  // only shown when everything in view shares one.
  const currencies = new Set(filteredReceipts.map(r => r.currency));
  const totalSpend =
    currencies.size === 1
      ? formatPrice(
          filteredReceipts.reduce((sum, r) => sum + receiptTotal(r), 0),
          filteredReceipts[0].currency,
        )
      : null;

  return (
    <div className="max-w-3xl mx-auto p-2 sm:p-6 space-y-4">
      {scanning ? (
        <ReceiptScanner
          homeId={selectedHomeId}
          userId={session?.user.id ?? ''}
          onSaved={() => {
            setScanning(false);
            load();
          }}
          onCancel={() => setScanning(false)}
        />
      ) : (
        <Button onClick={() => setScanning(true)}>
          <Plus size={15} /> Add Receipt
        </Button>
      )}

      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {[
          { id: TAB.RECEIPTS, label: `Receipts (${filteredReceipts.length})` },
          { id: TAB.ITEMS, label: `Item History (${itemHistory.length})` },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-2 text-sm bg-transparent border-none cursor-pointer border-b-2 ${
              tab === t.id
                ? 'border-b-blue-500 text-blue-600 font-medium'
                : 'border-b-transparent text-gray-500'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          placeholder={
            tab === TAB.RECEIPTS
              ? 'Search receipts, companies, items...'
              : 'Search items...'
          }
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <select
          value={merchantFilter}
          onChange={e => setMerchantFilter(e.target.value)}
          className="h-9 px-2 rounded border border-gray-200 dark:border-gray-700 bg-transparent text-sm"
        >
          <option value={ALL_MERCHANTS}>All companies</option>
          {merchants.map(name => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {!loaded ? null : tab === TAB.RECEIPTS ? (
        <div className="space-y-2">
          {filteredReceipts.length === 0 ? (
            <Text size="2" color="gray">
              No receipts yet. Add one to get started.
            </Text>
          ) : (
            <>
              <Text size="1" color="gray">
                {filteredReceipts.length} receipts
                {totalSpend ? ` · ${totalSpend} total` : ''}
              </Text>
              {filteredReceipts.map(receipt => (
                <ReceiptRow
                  key={receipt.id}
                  receipt={receipt}
                  onOpen={() => router.push(ROUTES.RECEIPTS_DETAIL(receipt.id))}
                  onDelete={() => deleteReceipt(receipt.id)}
                />
              ))}
            </>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {itemHistory.length === 0 ? (
            <Text size="2" color="gray">
              No items yet.
            </Text>
          ) : (
            itemHistory.map(item => (
              <button
                key={item.id}
                onClick={() =>
                  router.push(ROUTES.RECEIPTS_DETAIL(item.receiptId))
                }
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 text-left bg-transparent cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Text size="2" weight="medium">
                      {item.name}
                    </Text>
                    {item.category && (
                      <Badge variant="soft" size="1" color="blue">
                        {item.category}
                      </Badge>
                    )}
                  </div>
                  <Text size="1" color="gray" as="p">
                    <Store size={11} className="inline mr-1" />
                    {item.merchantName ?? 'Unknown'} ·{' '}
                    {formatDate(item.purchasedAt)}
                  </Text>
                </div>
                <div className="text-right shrink-0">
                  <Text size="2" weight="bold" as="p">
                    {formatPrice(item.totalPrice, item.currency)}
                  </Text>
                  <Text size="1" color="gray">
                    {item.quantity}
                    {item.unit ? ` ${item.unit}` : '×'}
                    {item.unitPrice
                      ? ` @ ${formatPrice(item.unitPrice, item.currency)}`
                      : ''}
                  </Text>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
