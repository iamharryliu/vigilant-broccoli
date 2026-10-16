'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Button, Input, Text } from '@vigilant-broccoli/react-lib';
import { ReceiptFormField, SELECT_CLASS } from './ReceiptFormField';
import { Draft, DraftTax, emptyTax } from './receipts.types';
import { CURRENCIES, parseNumber } from './receipt-utils';

const removeButtonClass =
  'shrink-0 h-9 w-9 flex items-center justify-center rounded border border-gray-200 dark:border-gray-700 bg-transparent text-gray-500 hover:text-red-500 cursor-pointer';

export default function ReceiptDetailsForm({
  draft,
  onChange,
}: {
  draft: Draft;
  onChange: (draft: Draft) => void;
}) {
  const update = (patch: Partial<Draft>) => onChange({ ...draft, ...patch });

  const updateTax = (index: number, patch: Partial<DraftTax>) =>
    update({
      taxes: draft.taxes.map((tax, i) =>
        i === index ? { ...tax, ...patch } : tax,
      ),
    });

  return (
    <div className="flex flex-col gap-3">
      <ReceiptFormField label="Company">
        <Input
          placeholder="e.g. Lucu Food"
          value={draft.merchantName}
          onChange={e => update({ merchantName: e.target.value })}
        />
      </ReceiptFormField>

      <ReceiptFormField label="Address">
        <Input
          placeholder="Street, city"
          value={draft.merchantAddress}
          onChange={e => update({ merchantAddress: e.target.value })}
        />
      </ReceiptFormField>

      <div className="flex gap-2">
        <ReceiptFormField label="Purchase Date">
          <Input
            type="date"
            value={draft.purchasedAt}
            onChange={e => update({ purchasedAt: e.target.value })}
          />
        </ReceiptFormField>
        <ReceiptFormField label="Currency">
          <select
            value={draft.currency}
            onChange={e => update({ currency: e.target.value })}
            className={SELECT_CLASS}
          >
            {CURRENCIES.map(currency => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </ReceiptFormField>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <Text size="1" weight="medium">
            Tax Rates
          </Text>
          <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
            <input
              type="checkbox"
              checked={draft.taxInclusive}
              onChange={e => update({ taxInclusive: e.target.checked })}
            />
            Included in prices
          </label>
        </div>
        <div className="flex flex-col gap-2">
          {draft.taxes.map((tax, i) => (
            <div key={i} className="flex gap-2 items-end">
              <ReceiptFormField label="Rate %">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={String(tax.rate)}
                  onChange={e =>
                    updateTax(i, { rate: parseNumber(e.target.value) ?? 0 })
                  }
                />
              </ReceiptFormField>
              <ReceiptFormField label="Tax">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={String(tax.taxAmount ?? 0)}
                  onChange={e =>
                    updateTax(i, { taxAmount: parseNumber(e.target.value) })
                  }
                />
              </ReceiptFormField>
              <ReceiptFormField label="Gross">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={String(tax.grossAmount ?? 0)}
                  onChange={e =>
                    updateTax(i, { grossAmount: parseNumber(e.target.value) })
                  }
                />
              </ReceiptFormField>
              <button
                onClick={() =>
                  update({ taxes: draft.taxes.filter((_, j) => j !== i) })
                }
                className={removeButtonClass}
                aria-label={`Remove ${tax.rate}% tax row`}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        <Button
          variant="secondary"
          className="mt-2"
          onClick={() => update({ taxes: [...draft.taxes, emptyTax()] })}
        >
          <Plus size={14} /> Add Tax Rate
        </Button>
      </div>

      <ReceiptFormField label="Notes">
        <Input
          placeholder="Optional"
          value={draft.notes}
          onChange={e => update({ notes: e.target.value })}
        />
      </ReceiptFormField>
    </div>
  );
}
