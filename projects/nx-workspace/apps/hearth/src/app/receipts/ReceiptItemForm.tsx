'use client';

import { Input } from '@vigilant-broccoli/react-lib';
import { ReceiptFormField, SELECT_CLASS } from './ReceiptFormField';
import { RECEIPT_CATEGORIES } from '../../lib/types';
import { DraftItem } from './receipts.types';
import { AS_PRINTED, parseNumber, round } from './receipt-utils';

const UNCATEGORIZED = 'Uncategorized';

export default function ReceiptItemForm({
  item,
  renameLanguage,
  onChange,
}: {
  item: DraftItem;
  renameLanguage: string;
  onChange: (item: DraftItem) => void;
}) {
  const update = (patch: Partial<DraftItem>) => {
    const merged = { ...item, ...patch };
    // Quantity and unit price drive the line total unless the total is edited.
    if (patch.quantity !== undefined || patch.unitPrice !== undefined) {
      merged.totalPrice = round(merged.quantity * (merged.unitPrice ?? 0));
    }
    onChange(merged);
  };

  const nameOptions = item.normalizedName
    ? [
        { value: item.normalizedName, tag: renameLanguage },
        { value: item.originalName, tag: AS_PRINTED },
      ]
    : [];

  return (
    <div className="flex flex-col gap-3">
      <ReceiptFormField label="Item">
        <Input
          value={item.name}
          onChange={e => update({ name: e.target.value })}
        />
      </ReceiptFormField>

      {nameOptions.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {nameOptions.map(option => (
            <button
              key={option.tag}
              onClick={() => update({ name: option.value })}
              className={`px-2 py-0.5 rounded-full border text-xs cursor-pointer ${
                item.name === option.value
                  ? 'border-blue-400 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                  : 'border-gray-200 dark:border-gray-700 bg-transparent text-gray-500'
              }`}
            >
              {option.value}
              <span className="opacity-60"> · {option.tag}</span>
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <ReceiptFormField label="Qty">
          <Input
            type="number"
            min="0"
            step="0.001"
            value={String(item.quantity)}
            onChange={e =>
              update({ quantity: parseNumber(e.target.value) ?? 0 })
            }
          />
        </ReceiptFormField>
        <ReceiptFormField label="Unit">
          <Input
            placeholder="kg"
            value={item.unit ?? ''}
            onChange={e => update({ unit: e.target.value || null })}
          />
        </ReceiptFormField>
      </div>

      <div className="flex gap-2">
        <ReceiptFormField label="Unit Price">
          <Input
            type="number"
            min="0"
            step="0.01"
            value={String(item.unitPrice ?? 0)}
            onChange={e =>
              update({ unitPrice: parseNumber(e.target.value) ?? 0 })
            }
          />
        </ReceiptFormField>
        <ReceiptFormField label="Line Total">
          <Input
            type="number"
            min="0"
            step="0.01"
            value={String(item.totalPrice)}
            onChange={e =>
              update({ totalPrice: parseNumber(e.target.value) ?? 0 })
            }
          />
        </ReceiptFormField>
      </div>

      <ReceiptFormField label="Category">
        <select
          value={item.category ?? ''}
          onChange={e => update({ category: e.target.value || null })}
          className={SELECT_CLASS}
        >
          <option value="">{UNCATEGORIZED}</option>
          {RECEIPT_CATEGORIES.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </ReceiptFormField>
    </div>
  );
}
