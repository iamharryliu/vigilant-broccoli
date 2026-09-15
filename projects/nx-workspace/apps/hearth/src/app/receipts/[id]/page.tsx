'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { LineChart, MapPin } from 'lucide-react';
import { Badge, Text } from '@vigilant-broccoli/react-lib';
import { useAuth } from '../../providers/auth-provider';
import { Receipt } from '../../../lib/types';
import { ROUTES } from '../../../lib/routes';
import { PAGE_TITLES, usePageTitle } from '../../../lib/page-title';
import {
  computeTotals,
  formatDate,
  formatPrice,
  formatRate,
  itemCount,
} from '../receipt-utils';

export default function ReceiptDetailPage() {
  const { id } = useParams<{ id: string }>();
  const session = useAuth();
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  usePageTitle(receipt?.merchantName ?? PAGE_TITLES.RECEIPT_DETAIL);

  useEffect(() => {
    if (!session?.access_token) return;
    fetch(`/api/receipts?id=${id}`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then(r => r.json())
      .then(setReceipt);
  }, [id, session?.access_token]);

  if (!receipt) return null;

  const computed = computeTotals(
    receipt.items,
    receipt.taxes,
    receipt.taxInclusive,
  );
  const subtotal = receipt.subtotal ?? computed.net;
  const tax = receipt.tax ?? computed.tax;
  const total = receipt.total ?? computed.total;

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
      <Link
        href={ROUTES.RECEIPTS}
        className="text-sm text-gray-500 hover:text-gray-700"
      >
        ← Back
      </Link>

      <div>
        <Text size="6" weight="bold" as="p">
          {receipt.merchantName ?? 'Unknown company'}
        </Text>
        <Text size="2" color="gray" as="p">
          {formatDate(receipt.purchasedAt)} · {receipt.items.length} items ·{' '}
          {itemCount(receipt.items)} units
        </Text>
        {receipt.merchantAddress && (
          <Text size="1" color="gray" as="p">
            <MapPin size={11} className="inline mr-1" />
            {receipt.merchantAddress}
          </Text>
        )}
      </div>

      {receipt.imageUrls.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {receipt.imageUrls.map((url, i) => (
            <a key={i} href={url} target="_blank" rel="noreferrer">
              <img
                src={url}
                alt={`Receipt page ${i + 1}`}
                className="h-40 w-32 object-cover rounded border border-gray-200 dark:border-gray-700"
              />
            </a>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <Text size="3" weight="medium">
          Line Items
        </Text>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-200 dark:border-gray-700">
                <th className="py-2 pr-2 font-medium">Item</th>
                <th className="py-2 px-2 font-medium text-right">Qty</th>
                <th className="py-2 px-2 font-medium text-right">Unit</th>
                <th className="py-2 pl-2 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {receipt.items.map(item => (
                <tr
                  key={item.id}
                  className="border-b border-gray-100 dark:border-gray-800"
                >
                  <td className="py-2 pr-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span>{item.name}</span>
                      {item.category && (
                        <Badge variant="soft" size="1" color="blue">
                          {item.category}
                        </Badge>
                      )}
                      {item.priceItemId && (
                        <Link
                          href={ROUTES.PRICE_TRACKER_DETAIL(item.priceItemId)}
                          className="text-gray-400 hover:text-blue-500"
                          aria-label={`Price history for ${item.name}`}
                        >
                          <LineChart size={13} />
                        </Link>
                      )}
                    </div>
                    {item.originalName && item.originalName !== item.name && (
                      <Text size="1" color="gray">
                        {item.originalName}
                      </Text>
                    )}
                  </td>
                  <td className="py-2 px-2 text-right whitespace-nowrap">
                    {item.quantity}
                    {item.unit ? ` ${item.unit}` : ''}
                  </td>
                  <td className="py-2 px-2 text-right whitespace-nowrap">
                    {item.unitPrice === null
                      ? '—'
                      : formatPrice(item.unitPrice, receipt.currency)}
                  </td>
                  <td className="py-2 pl-2 text-right whitespace-nowrap">
                    {formatPrice(item.totalPrice, receipt.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-1 pt-2 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between">
          <Text size="2" color="gray">
            {receipt.taxInclusive ? 'Net (excl. tax)' : 'Subtotal'}
          </Text>
          <Text size="2">{formatPrice(subtotal, receipt.currency)}</Text>
        </div>
        {receipt.taxes.map(taxRow => (
          <div key={taxRow.id} className="flex justify-between">
            <Text size="2" color="gray">
              Tax {formatRate(taxRow.rate)}
              {taxRow.grossAmount !== null
                ? ` on ${formatPrice(taxRow.grossAmount, receipt.currency)}`
                : ''}
            </Text>
            <Text size="2">
              {taxRow.taxAmount === null
                ? '—'
                : formatPrice(taxRow.taxAmount, receipt.currency)}
            </Text>
          </div>
        ))}
        <div className="flex justify-between">
          <Text size="2" color="gray">
            Tax {receipt.taxInclusive ? '(included)' : '(added)'}
          </Text>
          <Text size="2">{formatPrice(tax, receipt.currency)}</Text>
        </div>
        <div className="flex justify-between pt-1">
          <Text size="3" weight="bold">
            Total
          </Text>
          <Text size="3" weight="bold">
            {formatPrice(total, receipt.currency)}
          </Text>
        </div>
      </div>

      {receipt.notes && (
        <div>
          <Text size="3" weight="medium" as="p">
            Notes
          </Text>
          <Text size="2" color="gray">
            {receipt.notes}
          </Text>
        </div>
      )}
    </div>
  );
}
