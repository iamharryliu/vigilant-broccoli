'use client';

import { useEffect, useRef, useState } from 'react';
import { EllipsisVertical, Plus, Upload } from 'lucide-react';
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Text,
} from '@vigilant-broccoli/react-lib';
import { CONTENT_TYPE_HEADER, HTTP_METHOD } from '@vigilant-broccoli/common-js';
import { useAuth } from '../providers/auth-provider';
import { useJsonAuthHeaders } from '../hooks/use-auth-headers';
import {
  DEFAULT_RENAME_LANGUAGE,
  RENAME_ENABLED_KEY,
  RENAME_LANGUAGE_KEY,
} from '../../lib/types';
import {
  Draft,
  DraftItem,
  DraftTax,
  emptyDraft,
  emptyItem,
} from './receipts.types';
import { MAX_IMAGES_PER_RECEIPT } from '../api/receipts/limits';
import ReceiptItemForm from './ReceiptItemForm';
import ReceiptDetailsForm from './ReceiptDetailsForm';
import {
  AS_PRINTED,
  computeTotals,
  DEFAULT_CURRENCY,
  formatDate,
  formatPrice,
  formatRate,
  RECEIPTS_API,
  today,
} from './receipt-utils';

const ERROR_UPLOAD = 'Could not upload the receipt image.';
const ERROR_ANALYZE = 'Could not read that receipt. Try a clearer photo.';
const ERROR_SAVE = 'Could not save the receipt.';
const UNKNOWN_COMPANY = 'Unknown company';
const UNTITLED_ITEM = 'Untitled item';
const EDIT_LABEL = 'Edit';
const REMOVE_LABEL = 'Remove';
const EDIT_DETAILS_LABEL = 'Edit details';
const CHOOSE_PHOTO_LABEL = 'Choose Receipt Photo';
const REPLACE_PHOTO_LABEL = 'Replace Photo';
const ADD_RECEIPT_TITLE = 'Add Receipt';
const CONFIRM_RECEIPT_TITLE = 'Confirm Receipt';
const EDIT_ITEM_TITLE = 'Edit Item';
const RECEIPT_DETAILS_TITLE = 'Receipt Details';

type Step = 'upload' | 'analyzing' | 'confirm' | 'saving';

type Preview = { file: File; dataUrl: string };

type StagedImage = { key: string; mimeType: string };

const cardClass =
  'rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2';

type RowAction = { label: string; onSelect: () => void; danger?: boolean };

// Deliberately not Radix's DropdownMenu. Its Content portals to document.body,
// which lands outside this modal dialog's focus trap and the aria-hidden it
// applies to body-level siblings, so inside a dialog the menu could open but
// not be used. Rendering inline keeps it within the dialog's own subtree.
const RowMenu = ({
  label,
  actions,
}: {
  label: string;
  actions: RowAction[];
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onEscape = (e: KeyboardEvent) => {
      // Stops Escape from also closing the dialog underneath.
      if (e.key === 'Escape') {
        e.stopPropagation();
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onEscape, true);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onEscape, true);
    };
  }, [open]);

  return (
    <div className="relative shrink-0" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        aria-label={label}
        aria-expanded={open}
        className="h-8 w-8 flex items-center justify-center rounded border border-transparent bg-transparent text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
      >
        <EllipsisVertical size={16} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-20 min-w-44 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg py-1">
          {actions.map(action => (
            <button
              key={action.label}
              type="button"
              onClick={() => {
                setOpen(false);
                action.onSelect();
              }}
              className={`block w-full text-left px-3 py-1.5 text-sm bg-transparent border-none cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${
                action.danger
                  ? 'text-red-600'
                  : 'text-gray-700 dark:text-gray-200'
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const readAsDataUrl = (file: File) =>
  new Promise<string>(resolve => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target?.result as string);
    reader.readAsDataURL(file);
  });

const ItemRow = ({
  item,
  currency,
  renameLanguage,
  onEdit,
  onRemove,
  onUseName,
}: {
  item: DraftItem;
  currency: string;
  renameLanguage: string;
  onEdit: () => void;
  onRemove: () => void;
  onUseName: (name: string) => void;
}) => {
  const suggestion = item.normalizedName;
  const printedDiffers = item.originalName && item.name !== item.originalName;

  return (
    <div className={`${cardClass} flex items-start gap-2`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Text size="2" weight="medium">
            {item.name || UNTITLED_ITEM}
          </Text>
          {item.category && (
            <Badge variant="soft" size="1" color="blue">
              {item.category}
            </Badge>
          )}
        </div>
        {printedDiffers && (
          <Text size="1" color="gray" as="p">
            {item.originalName}
          </Text>
        )}
        <Text size="1" color="gray" as="p">
          {item.quantity}
          {item.unit ? ` ${item.unit}` : '×'}
          {item.unitPrice !== null
            ? ` · ${formatPrice(item.unitPrice, currency)}`
            : ''}
        </Text>
      </div>

      <Text size="2" weight="bold" className="shrink-0">
        {formatPrice(item.totalPrice, currency)}
      </Text>

      <RowMenu
        label={`Options for ${item.name || UNTITLED_ITEM}`}
        actions={[
          { label: EDIT_LABEL, onSelect: onEdit },
          ...(suggestion && item.name !== suggestion
            ? [
                {
                  label: `Use ${renameLanguage} name`,
                  onSelect: () => onUseName(suggestion),
                },
              ]
            : []),
          ...(printedDiffers
            ? [
                {
                  label: `Use name ${AS_PRINTED}`,
                  onSelect: () => onUseName(item.originalName),
                },
              ]
            : []),
          { label: REMOVE_LABEL, onSelect: onRemove, danger: true },
        ]}
      />
    </div>
  );
};

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
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [useNormalized, setUseNormalized] = useState(renamePreferred);
  // Editing happens as a step inside this same dialog rather than opening a
  // second one, so there is never a nested focus trap to fight.
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<DraftItem | null>(null);
  const [editingDetails, setEditingDetails] = useState<Draft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonHeaders = useJsonAuthHeaders();

  const isConfirming = step === 'confirm' || step === 'saving';

  const errorFrom = async (res: Response, fallback: string) => {
    const body = (await res.json().catch(() => null)) as {
      error?: string;
    } | null;
    return body?.error ?? fallback;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    // Clearing the input lets the same file be picked again after removing it,
    // which otherwise fires no change event.
    e.target.value = '';
    if (!files.length) return;

    const accepted = files.slice(0, MAX_IMAGES_PER_RECEIPT);
    setError(null);

    const loaded = await Promise.all(
      accepted.map(async file => ({
        file,
        dataUrl: await readAsDataUrl(file),
      })),
    );
    // Picking again replaces the current photo rather than appending, which is
    // the only sensible behaviour while the cap is one.
    setPreviews(loaded);
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
      ...emptyDraft(),
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

  const replaceItem = (index: number, item: DraftItem) =>
    setDraft(prev => ({
      ...prev,
      items: prev.items.map((existing, i) => (i === index ? item : existing)),
    }));

  // An index past the end means the editor was opened for a brand-new item.
  const commitItem = (index: number, item: DraftItem) =>
    setDraft(prev => ({
      ...prev,
      items:
        index >= prev.items.length
          ? [...prev.items, item]
          : prev.items.map((existing, i) => (i === index ? item : existing)),
    }));

  const startEditingItem = (index: number) => {
    setEditingIndex(index);
    setEditingItem(draft.items[index]);
  };

  const closeItemEditor = () => {
    setEditingIndex(null);
    setEditingItem(null);
  };

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

  const totals = computeTotals(draft.items, draft.taxes, draft.taxInclusive);

  const confirmBody = (
    <div className="flex flex-col gap-4">
      <div className={`${cardClass} flex items-start gap-2`}>
        <div className="flex-1 min-w-0">
          <Text size="2" weight="medium" as="p">
            {draft.merchantName || UNKNOWN_COMPANY}
          </Text>
          <Text size="1" color="gray" as="p">
            {formatDate(draft.purchasedAt)} · {draft.currency}
          </Text>
          {draft.merchantAddress && (
            <Text size="1" color="gray" as="p">
              {draft.merchantAddress}
            </Text>
          )}
          {draft.notes && (
            <Text size="1" color="gray" as="p">
              {draft.notes}
            </Text>
          )}
        </div>
        <RowMenu
          label="Receipt options"
          actions={[
            {
              label: EDIT_DETAILS_LABEL,
              onSelect: () => setEditingDetails(draft),
            },
          ]}
        />
      </div>

      <div>
        <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
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
            <ItemRow
              key={i}
              item={item}
              currency={draft.currency}
              renameLanguage={renameLanguage}
              onEdit={() => startEditingItem(i)}
              onRemove={() =>
                setDraft(prev => ({
                  ...prev,
                  items: prev.items.filter((_, j) => j !== i),
                }))
              }
              onUseName={name => replaceItem(i, { ...item, name })}
            />
          ))}
        </div>

        <Button
          variant="secondary"
          className="mt-2"
          onClick={() => {
            // Index past the end marks "new" — the row is only appended on
            // Done, so cancelling leaves no blank item behind.
            setEditingIndex(draft.items.length);
            setEditingItem(emptyItem());
          }}
        >
          <Plus size={14} /> Add Item
        </Button>
      </div>

      <div className="pt-2 border-t border-gray-200 dark:border-gray-700 space-y-1">
        <div className="flex justify-between">
          <Text size="2" color="gray">
            {draft.taxInclusive ? 'Net (excl. tax)' : 'Subtotal'}
          </Text>
          <Text size="2">{formatPrice(totals.net, draft.currency)}</Text>
        </div>
        {draft.taxes.map((taxRow, i) => (
          <div key={i} className="flex justify-between">
            <Text size="1" color="gray">
              Tax {formatRate(taxRow.rate)}
              {taxRow.grossAmount !== null
                ? ` on ${formatPrice(taxRow.grossAmount, draft.currency)}`
                : ''}
            </Text>
            <Text size="1" color="gray">
              {formatPrice(taxRow.taxAmount ?? 0, draft.currency)}
            </Text>
          </div>
        ))}
        <div className="flex justify-between">
          <Text size="2" color="gray">
            Tax {draft.taxInclusive ? '(included)' : '(added)'}
          </Text>
          <Text size="2">{formatPrice(totals.tax, draft.currency)}</Text>
        </div>
        <div className="flex justify-between pt-1">
          <Text size="3" weight="bold">
            Total
          </Text>
          <Text size="3" weight="bold">
            {formatPrice(totals.total, draft.currency)}
          </Text>
        </div>
      </div>

      {error && (
        <Text size="1" color="red">
          {error}
        </Text>
      )}
    </div>
  );

  const uploadBody = (
    <div className="flex flex-col gap-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
        <Upload size={14} />{' '}
        {previews.length ? REPLACE_PHOTO_LABEL : CHOOSE_PHOTO_LABEL}
      </Button>

      {previews.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {previews.map((p, i) => (
            <div key={i} className="relative">
              <img
                src={p.dataUrl}
                alt="Selected receipt"
                className="max-h-64 w-auto rounded border border-gray-200 dark:border-gray-700"
              />
              <button
                onClick={() =>
                  setPreviews(prev => prev.filter((_, j) => j !== i))
                }
                className="absolute top-0.5 right-0.5 bg-black/60 text-white border-none rounded-full w-5 h-5 cursor-pointer text-xs leading-5 text-center"
                aria-label="Remove photo"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {error && (
        <Text size="1" color="red">
          {error}
        </Text>
      )}
    </div>
  );

  const view = editingItem
    ? {
        title: EDIT_ITEM_TITLE,
        body: (
          <ReceiptItemForm
            item={editingItem}
            renameLanguage={renameLanguage}
            onChange={setEditingItem}
          />
        ),
        footer: (
          <>
            <Button variant="secondary" onClick={closeItemEditor}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (editingIndex !== null)
                  commitItem(editingIndex, editingItem);
                closeItemEditor();
              }}
              disabled={!editingItem.name.trim()}
            >
              Done
            </Button>
          </>
        ),
      }
    : editingDetails
      ? {
          title: RECEIPT_DETAILS_TITLE,
          body: (
            <ReceiptDetailsForm
              draft={editingDetails}
              onChange={setEditingDetails}
            />
          ),
          footer: (
            <>
              <Button
                variant="secondary"
                onClick={() => setEditingDetails(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setDraft(editingDetails);
                  setEditingDetails(null);
                }}
              >
                Done
              </Button>
            </>
          ),
        }
      : isConfirming
        ? {
            title: CONFIRM_RECEIPT_TITLE,
            body: confirmBody,
            footer: (
              <>
                <Button variant="secondary" onClick={onCancel}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={
                    step === 'saving' || !draft.items.some(i => i.name.trim())
                  }
                >
                  {step === 'saving' ? 'Saving...' : 'Save Receipt'}
                </Button>
              </>
            ),
          }
        : {
            title: ADD_RECEIPT_TITLE,
            body: uploadBody,
            footer: (
              <>
                <Button variant="secondary" onClick={onCancel}>
                  Cancel
                </Button>
                <Button
                  onClick={handleScan}
                  disabled={!previews.length || step === 'analyzing'}
                >
                  {step === 'analyzing' ? 'Reading receipt...' : 'Scan Receipt'}
                </Button>
              </>
            ),
          };

  return (
    <Dialog open onOpenChange={open => !open && onCancel()}>
      <DialogContent
        fullScreenOnMobile
        className="sm:max-w-2xl max-h-[90dvh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle>{view.title}</DialogTitle>
        </DialogHeader>

        {view.body}

        <DialogFooter>{view.footer}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
