'use client';

import { useRef, useState } from 'react';
import { Plus, Trash2, Upload } from 'lucide-react';
import { Badge, Button, Input, Text } from '@vigilant-broccoli/react-lib';
import { CONTENT_TYPE_HEADER, HTTP_METHOD } from '@vigilant-broccoli/common-js';
import { useAuth } from '../providers/auth-provider';
import { useJsonAuthHeaders } from '../hooks/use-auth-headers';
import {
  DEFAULT_RENAME_LANGUAGE,
  RECEIPT_CATEGORIES,
  RENAME_ENABLED_KEY,
  RENAME_LANGUAGE_KEY,
} from '../../lib/types';
import {
  computeTotals,
  CURRENCIES,
  DEFAULT_CURRENCY,
  formatPrice,
  parseNumber,
  RECEIPTS_API,
  round,
  today,
} from './receipt-utils';

const MAX_IMAGES = 5;
const ERROR_UPLOAD = 'Could not upload the receipt image.';
const ERROR_ANALYZE = 'Could not read that receipt. Try a clearer photo.';
const ERROR_SAVE = 'Could not save the receipt.';

type Step = 'upload' | 'analyzing' | 'confirm' | 'saving';

type Preview = { file: File; dataUrl: string };

type StagedImage = { key: string; mimeType: string };

export type DraftItem = {
  name: string;
  originalName: string;
  normalizedName: string | null;
  category: string | null;
  unit: string | null;
  quantity: number;
  unitPrice: number | null;
  totalPrice: number;
};

export type DraftTax = {
  rate: number;
  taxAmount: number | null;
  netAmount: number | null;
  grossAmount: number | null;
};

type Draft = {
  merchantName: string;
  merchantAddress: string;
  purchasedAt: string;
  currency: string;
  taxInclusive: boolean;
  notes: string;
  items: DraftItem[];
  taxes: DraftTax[];
};

const EMPTY_DRAFT: Draft = {
  merchantName: '',
  merchantAddress: '',
  purchasedAt: today(),
  currency: DEFAULT_CURRENCY,
  taxInclusive: true,
  notes: '',
  items: [],
  taxes: [],
};

const EMPTY_ITEM: DraftItem = {
  name: '',
  originalName: '',
  normalizedName: null,
  category: null,
  unit: null,
  quantity: 1,
  unitPrice: 0,
  totalPrice: 0,
};

const EMPTY_TAX: DraftTax = {
  rate: 0,
  taxAmount: 0,
  netAmount: null,
  grossAmount: null,
};

const readAsDataUrl = (file: File) =>
  new Promise<string>(resolve => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target?.result as string);
    reader.readAsDataURL(file);
  });

const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex-1 min-w-0">
    <Text size="1" weight="medium" as="p" mb="1">
      {label}
    </Text>
    {children}
  </div>
);

const selectClass =
  'w-full h-9 px-2 rounded border border-gray-200 dark:border-gray-700 bg-transparent text-sm';

export default function ReceiptScanner({
  homeId,
  userId,
  onSaved,
  onCancel,
}: {
  homeId: number;
  userId: string;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const session = useAuth();
  const metadata = session?.user.user_metadata ?? {};
  const renamePreferred = (metadata[RENAME_ENABLED_KEY] as boolean) ?? false;
  const renameLanguage =
    (metadata[RENAME_LANGUAGE_KEY] as string) ?? DEFAULT_RENAME_LANGUAGE;

  const [step, setStep] = useState<Step>('upload');
  const [previews, setPreviews] = useState<Preview[]>([]);
  const [staged, setStaged] = useState<StagedImage[]>([]);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [useNormalized, setUseNormalized] = useState(renamePreferred);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonHeaders = useJsonAuthHeaders();

  const errorFrom = async (res: Response, fallback: string) => {
    const body = (await res.json().catch(() => null)) as {
      error?: string;
    } | null;
    return body?.error ?? fallback;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, MAX_IMAGES);
    if (!files.length) return;
    const loaded = await Promise.all(
      files.map(async file => ({ file, dataUrl: await readAsDataUrl(file) })),
    );
    setPreviews(prev => [...prev, ...loaded].slice(0, MAX_IMAGES));
    setError(null);
  };

  const uploadToStaging = async (): Promise<StagedImage[]> => {
    const res = await fetch(RECEIPTS_API.UPLOAD_URL, {
      method: HTTP_METHOD.POST,
      headers: await jsonHeaders(),
      body: JSON.stringify({
        images: previews.map(p => ({
          mimeType: p.file.type,
          size: p.file.size,
        })),
      }),
    });
    if (!res.ok) throw new Error(await errorFrom(res, ERROR_UPLOAD));

    const { targets } = (await res.json()) as {
      targets: { key: string; uploadUrl: string; mimeType: string }[];
    };

    await Promise.all(
      targets.map(async (target, i) => {
        const put = await fetch(target.uploadUrl, {
          method: HTTP_METHOD.PUT,
          body: previews[i].file,
          headers: { [CONTENT_TYPE_HEADER]: target.mimeType },
        });
        if (!put.ok) throw new Error(ERROR_UPLOAD);
      }),
    );

    return targets.map(t => ({ key: t.key, mimeType: t.mimeType }));
  };

  const handleScan = async () => {
    if (!previews.length) return;
    setStep('analyzing');
    setError(null);

    let stagedImages: StagedImage[];
    try {
      stagedImages = await uploadToStaging();
    } catch (e) {
      setError((e as Error).message || ERROR_UPLOAD);
      setStep('upload');
      return;
    }
    setStaged(stagedImages);

    const res = await fetch(RECEIPTS_API.ANALYZE, {
      method: HTTP_METHOD.POST,
      headers: await jsonHeaders(),
      body: JSON.stringify({
        keys: stagedImages.map(s => s.key),
        language: renameLanguage,
      }),
    });

    if (!res.ok) {
      setError(await errorFrom(res, ERROR_ANALYZE));
      setStep('upload');
      return;
    }

    const result = (await res.json()) as {
      merchantName: string | null;
      merchantAddress: string | null;
      purchasedAt: string | null;
      currency: string | null;
      taxInclusive: boolean;
      taxes: DraftTax[];
      items: DraftItem[];
    };

    setDraft({
      ...EMPTY_DRAFT,
      merchantName: result.merchantName ?? '',
      merchantAddress: result.merchantAddress ?? '',
      purchasedAt: result.purchasedAt ?? today(),
      currency: result.currency ?? DEFAULT_CURRENCY,
      taxInclusive: result.taxInclusive,
      taxes: result.taxes ?? [],
      items: result.items.map(item => ({
        ...item,
        name:
          renamePreferred && item.normalizedName
            ? item.normalizedName
            : item.originalName,
      })),
    });
    setUseNormalized(renamePreferred);
    setStep('confirm');
  };

  const updateItem = (index: number, patch: Partial<DraftItem>) =>
    setDraft(prev => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i !== index) return item;
        const merged = { ...item, ...patch };
        // Quantity and unit price are the source of truth; the line total
        // follows unless the user edits the total directly.
        if (patch.quantity !== undefined || patch.unitPrice !== undefined) {
          merged.totalPrice = round(merged.quantity * (merged.unitPrice ?? 0));
        }
        return merged;
      }),
    }));

  const updateTax = (index: number, patch: Partial<DraftTax>) =>
    setDraft(prev => ({
      ...prev,
      taxes: prev.taxes.map((tax, i) =>
        i === index ? { ...tax, ...patch } : tax,
      ),
    }));

  // Flips every suggested item at once. Items the parser could not identify,
  // and any name the user typed by hand, keep whatever they already have.
  const applyNameSource = (normalized: boolean) => {
    setUseNormalized(normalized);
    setDraft(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.normalizedName
          ? {
              ...item,
              name: normalized ? item.normalizedName : item.originalName,
            }
          : item,
      ),
    }));
  };

  const handleSave = async () => {
    const items = draft.items.filter(item => item.name.trim());
    if (!items.length) return;

    setStep('saving');
    const { net, tax, total } = computeTotals(
      items,
      draft.taxes,
      draft.taxInclusive,
    );

    const res = await fetch(RECEIPTS_API.BASE, {
      method: HTTP_METHOD.POST,
      headers: await jsonHeaders(),
      body: JSON.stringify({
        merchantName: draft.merchantName.trim() || null,
        merchantAddress: draft.merchantAddress.trim() || null,
        purchasedAt: draft.purchasedAt,
        currency: draft.currency,
        taxInclusive: draft.taxInclusive,
        subtotal: net,
        tax,
        total,
        notes: draft.notes.trim() || null,
        items,
        taxes: draft.taxes,
        images: staged,
        homeId,
        userId,
      }),
    });

    if (!res.ok) {
      setError(await errorFrom(res, ERROR_SAVE));
      setStep('confirm');
      return;
    }

    onSaved();
  };

  if (step === 'confirm' || step === 'saving') {
    const { net, tax, total } = computeTotals(
      draft.items,
      draft.taxes,
      draft.taxInclusive,
    );

    return (
      <div className="flex flex-col gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <Text size="3" weight="bold">
          Confirm Receipt
        </Text>

        <div className="flex flex-col sm:flex-row gap-3">
          <Field label="Company">
            <Input
              placeholder="e.g. Lucu Food"
              value={draft.merchantName}
              onChange={e =>
                setDraft(p => ({ ...p, merchantName: e.target.value }))
              }
            />
          </Field>
          <Field label="Purchase Date">
            <Input
              type="date"
              value={draft.purchasedAt}
              onChange={e =>
                setDraft(p => ({ ...p, purchasedAt: e.target.value }))
              }
            />
          </Field>
          <Field label="Currency">
            <select
              value={draft.currency}
              onChange={e =>
                setDraft(p => ({ ...p, currency: e.target.value }))
              }
              className={selectClass}
            >
              {CURRENCIES.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Address (optional)">
          <Input
            placeholder="Street, city"
            value={draft.merchantAddress}
            onChange={e =>
              setDraft(p => ({ ...p, merchantAddress: e.target.value }))
            }
          />
        </Field>

        <div>
          <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
            <Text size="1" weight="medium">
              Items ({draft.items.length})
            </Text>
            {draft.items.some(item => item.normalizedName) && (
              <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useNormalized}
                  onChange={e => applyNameSource(e.target.checked)}
                />
                Rename to {renameLanguage}
              </label>
            )}
          </div>
          <div className="flex flex-col gap-2">
            {draft.items.map((item, i) => (
              <div
                key={i}
                className="flex flex-col gap-2 p-2 rounded border border-gray-200 dark:border-gray-700"
              >
                <div className="flex gap-2 items-end">
                  <Field label="Item">
                    <Input
                      value={item.name}
                      onChange={e => updateItem(i, { name: e.target.value })}
                    />
                  </Field>
                  <button
                    onClick={() =>
                      setDraft(p => ({
                        ...p,
                        items: p.items.filter((_, j) => j !== i),
                      }))
                    }
                    className="shrink-0 h-9 w-9 flex items-center justify-center rounded border border-gray-200 dark:border-gray-700 bg-transparent text-gray-500 hover:text-red-500 cursor-pointer"
                    aria-label={`Remove ${item.name || 'item'}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                {item.normalizedName && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[
                      { value: item.normalizedName, tag: renameLanguage },
                      { value: item.originalName, tag: 'as printed' },
                    ].map(option => (
                      <button
                        key={option.tag}
                        onClick={() => updateItem(i, { name: option.value })}
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
                  <Field label="Qty">
                    <Input
                      type="number"
                      min="0"
                      step="0.001"
                      value={String(item.quantity)}
                      onChange={e =>
                        updateItem(i, {
                          quantity: parseNumber(e.target.value) ?? 0,
                        })
                      }
                    />
                  </Field>
                  <Field label="Unit">
                    <Input
                      placeholder="kg"
                      value={item.unit ?? ''}
                      onChange={e =>
                        updateItem(i, { unit: e.target.value || null })
                      }
                    />
                  </Field>
                  <Field label="Unit Price">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={String(item.unitPrice ?? 0)}
                      onChange={e =>
                        updateItem(i, {
                          unitPrice: parseNumber(e.target.value) ?? 0,
                        })
                      }
                    />
                  </Field>
                  <Field label="Line Total">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={String(item.totalPrice)}
                      onChange={e =>
                        updateItem(i, {
                          totalPrice: parseNumber(e.target.value) ?? 0,
                        })
                      }
                    />
                  </Field>
                </div>
                <Field label="Category">
                  <select
                    value={item.category ?? ''}
                    onChange={e =>
                      updateItem(i, { category: e.target.value || null })
                    }
                    className={selectClass}
                  >
                    <option value="">Uncategorized</option>
                    {RECEIPT_CATEGORIES.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            ))}
          </div>
          <Button
            variant="secondary"
            className="mt-2"
            onClick={() =>
              setDraft(p => ({ ...p, items: [...p.items, { ...EMPTY_ITEM }] }))
            }
          >
            <Plus size={14} /> Add Item
          </Button>
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
                onChange={e =>
                  setDraft(p => ({ ...p, taxInclusive: e.target.checked }))
                }
              />
              Tax already included in prices
            </label>
          </div>
          <div className="flex flex-col gap-2">
            {draft.taxes.map((taxRow, i) => (
              <div key={i} className="flex gap-2 items-end">
                <Field label="Rate %">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={String(taxRow.rate)}
                    onChange={e =>
                      updateTax(i, { rate: parseNumber(e.target.value) ?? 0 })
                    }
                  />
                </Field>
                <Field label="Tax Amount">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={String(taxRow.taxAmount ?? 0)}
                    onChange={e =>
                      updateTax(i, { taxAmount: parseNumber(e.target.value) })
                    }
                  />
                </Field>
                <Field label="Gross">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={String(taxRow.grossAmount ?? 0)}
                    onChange={e =>
                      updateTax(i, { grossAmount: parseNumber(e.target.value) })
                    }
                  />
                </Field>
                <button
                  onClick={() =>
                    setDraft(p => ({
                      ...p,
                      taxes: p.taxes.filter((_, j) => j !== i),
                    }))
                  }
                  className="shrink-0 h-9 w-9 flex items-center justify-center rounded border border-gray-200 dark:border-gray-700 bg-transparent text-gray-500 hover:text-red-500 cursor-pointer"
                  aria-label={`Remove ${taxRow.rate}% tax row`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <Button
            variant="secondary"
            className="mt-2"
            onClick={() =>
              setDraft(p => ({ ...p, taxes: [...p.taxes, { ...EMPTY_TAX }] }))
            }
          >
            <Plus size={14} /> Add Tax Rate
          </Button>
        </div>

        <Field label="Notes">
          <Input
            placeholder="Optional"
            value={draft.notes}
            onChange={e => setDraft(p => ({ ...p, notes: e.target.value }))}
          />
        </Field>

        <div className="pt-2 border-t border-gray-200 dark:border-gray-700 space-y-1">
          <div className="flex justify-between">
            <Text size="2" color="gray">
              {draft.taxInclusive ? 'Net (excl. tax)' : 'Subtotal'}
            </Text>
            <Text size="2">{formatPrice(net, draft.currency)}</Text>
          </div>
          <div className="flex justify-between">
            <Text size="2" color="gray">
              Tax {draft.taxInclusive ? '(included)' : '(added)'}
            </Text>
            <Text size="2">{formatPrice(tax, draft.currency)}</Text>
          </div>
          <div className="flex justify-between pt-1">
            <Text size="3" weight="bold">
              Total
            </Text>
            <Text size="3" weight="bold">
              {formatPrice(total, draft.currency)}
            </Text>
          </div>
        </div>

        {error && (
          <Text size="1" color="red">
            {error}
          </Text>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={
              step === 'saving' || !draft.items.some(i => i.name.trim())
            }
          >
            {step === 'saving' ? 'Saving...' : 'Save Receipt'}
          </Button>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
      <Text size="3" weight="bold">
        Add Receipt
      </Text>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
        <Upload size={14} /> Choose Receipt Photos
      </Button>

      {previews.length > 0 && (
        <>
          <div className="flex gap-2 flex-wrap">
            {previews.map((p, i) => (
              <div key={i} className="relative">
                <img
                  src={p.dataUrl}
                  alt={`Receipt page ${i + 1}`}
                  className="h-28 w-28 object-cover rounded"
                />
                <button
                  onClick={() =>
                    setPreviews(prev => prev.filter((_, j) => j !== i))
                  }
                  className="absolute top-0.5 right-0.5 bg-black/60 text-white border-none rounded-full w-5 h-5 cursor-pointer text-xs leading-5 text-center"
                  aria-label={`Remove page ${i + 1}`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <Badge variant="soft" size="1">
            {previews.length} of {MAX_IMAGES} pages
          </Badge>
        </>
      )}

      {error && (
        <Text size="1" color="red">
          {error}
        </Text>
      )}

      <div className="flex gap-2 flex-wrap">
        <Button
          onClick={handleScan}
          disabled={!previews.length || step === 'analyzing'}
        >
          {step === 'analyzing' ? 'Reading receipt...' : 'Scan Receipt'}
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            setDraft({ ...EMPTY_DRAFT, items: [{ ...EMPTY_ITEM }] });
            setStep('confirm');
          }}
        >
          Enter Manually
        </Button>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
