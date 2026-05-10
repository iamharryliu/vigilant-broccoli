'use client';

import { useState, useEffect, useRef, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Flex, Text, TextField, Badge, TextArea } from '@radix-ui/themes';
import {
  Button,
  Select,
  CRUDItemList,
  CRUDFormProps,
} from '@vigilant-broccoli/react-lib';
import { Button as RadixButton } from '@radix-ui/themes';
import { FORM_TYPE } from '@vigilant-broccoli/common-js';
import { supabase } from '../../../libs/supabase';
import { useAuth } from '../providers/auth-provider';
import { ROUTES } from '../../lib/routes';
import { PriceItem } from '../../lib/types';

type HomeOption = { id: number; name: string };

type ParsedLineItem = {
  name: string;
  price: number;
  quantity: number;
  unit: string | null;
  category: string | null;
  confirmed: boolean;
};

type AnalyzeResult = {
  store: string | null;
  purchasedAt: string | null;
  items: Omit<ParsedLineItem, 'confirmed'>[];
};

type PreviewImage = {
  base64: string;
  mimeType: string;
  dataUrl: string;
};

type PriceItemFormValues = {
  id: string;
  name: string;
  category: string | null;
  unit: string | null;
  entries: { price: number; store: string | null; purchasedAt: string }[];
};

const DEFAULT_FORM: PriceItemFormValues = {
  id: '',
  name: '',
  category: null,
  unit: null,
  entries: [],
};

const COPY = {
  LIST: { TITLE: 'Price Tracker', EMPTY_MESSAGE: 'No items tracked yet.' },
  [FORM_TYPE.CREATE]: {
    TITLE: 'Add Price Entry',
    DESCRIPTION: 'Upload a receipt or enter item details manually.',
  },
  [FORM_TYPE.UPDATE]: {
    TITLE: 'Edit Item',
    DESCRIPTION: 'Update item name, category, or unit.',
  },
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(
    price,
  );

const latestPrice = (item: PriceItem) =>
  item.entries.length > 0
    ? item.entries.reduce((a, b) => (a.purchasedAt > b.purchasedAt ? a : b))
    : null;

const PriceItemListItem = ({
  item,
  ellipsis,
}: {
  item: PriceItem;
  ellipsis?: ReactNode;
}) => {
  const latest = latestPrice(item);
  const prices = item.entries.map(e => e.price);
  const minPrice = prices.length ? Math.min(...prices) : null;
  const maxPrice = prices.length ? Math.max(...prices) : null;

  return (
    <div className="flex items-center justify-between gap-3">
      <Box className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Text weight="bold" size="2">
            {item.name}
          </Text>
          {item.category && (
            <Badge variant="soft" size="1" color="blue">
              {item.category}
            </Badge>
          )}
          {item.unit && (
            <Badge variant="outline" size="1">
              {item.unit}
            </Badge>
          )}
        </div>
        {latest && (
          <Text size="1" color="gray" as="p">
            Latest: {formatPrice(latest.price)}
            {latest.store ? ` @ ${latest.store}` : ''} on{' '}
            {new Date(latest.purchasedAt).toLocaleDateString()}
          </Text>
        )}
        {prices.length > 1 && minPrice !== null && maxPrice !== null && (
          <Text size="1" color="gray" as="p">
            Range: {formatPrice(minPrice)} – {formatPrice(maxPrice)} (
            {prices.length} entries)
          </Text>
        )}
      </Box>
      {ellipsis}
    </div>
  );
};

const PriceItemForm = ({
  formType,
  initialFormValues,
  submitHandler,
}: CRUDFormProps<PriceItemFormValues>) => {
  const session = useAuth();
  const isUpdate = formType === FORM_TYPE.UPDATE;

  const [name, setName] = useState(initialFormValues.name);
  const [category, setCategory] = useState(initialFormValues.category ?? '');
  const [unit, setUnit] = useState(initialFormValues.unit ?? '');

  const [previews, setPreviews] = useState<PreviewImage[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [pendingItems, setPendingItems] = useState<ParsedLineItem[]>([]);
  const [receiptStore, setReceiptStore] = useState<string>('');
  const [receiptDate, setReceiptDate] = useState<string>(
    new Date().toISOString().split('T')[0],
  );
  const [manualEntry, setManualEntry] = useState(false);
  const [manualPrice, setManualPrice] = useState('');
  const [manualStore, setManualStore] = useState('');
  const [manualDate, setManualDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    Promise.all(
      files.map(
        file =>
          new Promise<PreviewImage>(resolve => {
            const reader = new FileReader();
            reader.onload = ev => {
              const dataUrl = ev.target?.result as string;
              resolve({
                base64: dataUrl.split(',')[1],
                mimeType: file.type,
                dataUrl,
              });
            };
            reader.readAsDataURL(file);
          }),
      ),
    ).then(newPreviews => setPreviews(prev => [...prev, ...newPreviews]));
  };

  const handleAnalyze = async () => {
    if (!previews.length) return;
    setAnalyzing(true);
    setAnalyzeError(null);
    const accessToken = session?.access_token ?? '';
    const res = await fetch('/api/price-tracker/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        images: previews.map(p => ({ base64: p.base64, mimeType: p.mimeType })),
      }),
    });
    if (!res.ok) {
      setAnalyzeError('Failed to analyze receipt.');
      setAnalyzing(false);
      return;
    }
    const result: AnalyzeResult = await res.json();
    setReceiptStore(result.store ?? '');
    setReceiptDate(
      result.purchasedAt ?? new Date().toISOString().split('T')[0],
    );
    setPendingItems(result.items.map(item => ({ ...item, confirmed: true })));
    setAnalyzing(false);
  };

  const handleSubmitReceipt = async () => {
    const confirmed = pendingItems.filter(i => i.confirmed);
    if (!confirmed.length) return;
    await submitHandler(
      {
        ...initialFormValues,
        entries: confirmed.map(i => ({
          price: i.price * (i.quantity ?? 1),
          store: receiptStore || null,
          purchasedAt: receiptDate,
          name: i.name,
          category: i.category,
          unit: i.unit,
        })) as PriceItemFormValues['entries'] &
          { name: string; category: string | null; unit: string | null }[],
      } as PriceItemFormValues,
      formType,
    );
  };

  const handleSubmitManual = async () => {
    const price = parseFloat(manualPrice);
    if (!name.trim() || isNaN(price)) return;
    await submitHandler(
      {
        ...initialFormValues,
        name,
        category: category || null,
        unit: unit || null,
        entries: [
          { price, store: manualStore || null, purchasedAt: manualDate },
        ],
      },
      formType,
    );
  };

  if (isUpdate) {
    return (
      <Flex direction="column" gap="3" mt="3">
        <div>
          <Text size="1" weight="medium" as="p" mb="1">
            Name
          </Text>
          <TextField.Root
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>
        <div>
          <Text size="1" weight="medium" as="p" mb="1">
            Category
          </Text>
          <TextField.Root
            placeholder="e.g. Produce, Dairy"
            value={category}
            onChange={e => setCategory(e.target.value)}
          />
        </div>
        <div>
          <Text size="1" weight="medium" as="p" mb="1">
            Unit
          </Text>
          <TextField.Root
            placeholder="e.g. kg, each, L"
            value={unit}
            onChange={e => setUnit(e.target.value)}
          />
        </div>
        <Button
          onClick={async () =>
            submitHandler(
              {
                ...initialFormValues,
                name,
                category: category || null,
                unit: unit || null,
              },
              formType,
            )
          }
        >
          Save
        </Button>
      </Flex>
    );
  }

  if (pendingItems.length > 0) {
    return (
      <Flex direction="column" gap="3" mt="3">
        <div>
          <Text size="1" weight="medium" as="p" mb="1">
            Store
          </Text>
          <TextField.Root
            placeholder="Store name"
            value={receiptStore}
            onChange={e => setReceiptStore(e.target.value)}
          />
        </div>
        <div>
          <Text size="1" weight="medium" as="p" mb="1">
            Purchase Date
          </Text>
          <TextField.Root
            type="date"
            value={receiptDate}
            onChange={e => setReceiptDate(e.target.value)}
          />
        </div>
        <Text size="1" weight="medium" as="p">
          Confirm Items ({pendingItems.filter(i => i.confirmed).length}{' '}
          selected)
        </Text>
        <Flex direction="column" gap="2">
          {pendingItems.map((item, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 p-2 rounded border cursor-pointer ${
                item.confirmed
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-200 opacity-50'
              }`}
              onClick={() =>
                setPendingItems(prev =>
                  prev.map((p, j) =>
                    j === i ? { ...p, confirmed: !p.confirmed } : p,
                  ),
                )
              }
            >
              <input
                type="checkbox"
                checked={item.confirmed}
                readOnly
                className="shrink-0"
              />
              <div className="flex-1 min-w-0">
                <Text size="2" weight="medium">
                  {item.name}
                </Text>
                {item.category && (
                  <Badge size="1" variant="soft" color="blue" className="ml-1">
                    {item.category}
                  </Badge>
                )}
              </div>
              <Text size="2" weight="bold">
                {formatPrice(item.price)}
                {item.quantity > 1 ? ` ×${item.quantity}` : ''}
              </Text>
            </div>
          ))}
        </Flex>
        <Flex gap="2">
          <RadixButton
            onClick={handleSubmitReceipt}
            disabled={!pendingItems.some(i => i.confirmed)}
          >
            Save {pendingItems.filter(i => i.confirmed).length} Items
          </RadixButton>
          <RadixButton
            variant="soft"
            onClick={() => {
              setPendingItems([]);
              setPreviews([]);
            }}
          >
            Back
          </RadixButton>
        </Flex>
      </Flex>
    );
  }

  return (
    <Flex direction="column" gap="3" mt="3">
      <Flex gap="2">
        <RadixButton
          variant={!manualEntry ? 'solid' : 'soft'}
          onClick={() => setManualEntry(false)}
        >
          Upload Receipt
        </RadixButton>
        <RadixButton
          variant={manualEntry ? 'solid' : 'soft'}
          onClick={() => setManualEntry(true)}
        >
          Manual Entry
        </RadixButton>
      </Flex>

      {!manualEntry ? (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="text-sm"
          />
          {previews.length > 0 && (
            <Flex gap="2" wrap="wrap">
              {previews.map((p, i) => (
                <div key={i} className="relative">
                  <img
                    src={p.dataUrl}
                    alt={`receipt ${i + 1}`}
                    className="h-24 w-24 object-cover rounded"
                  />
                  <button
                    onClick={() =>
                      setPreviews(prev => prev.filter((_, j) => j !== i))
                    }
                    className="absolute top-0.5 right-0.5 bg-black/60 text-white border-none rounded-full w-5 h-5 cursor-pointer text-xs leading-5 text-center"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </Flex>
          )}
          {analyzeError && (
            <Text size="1" color="red">
              {analyzeError}
            </Text>
          )}
          <RadixButton
            onClick={handleAnalyze}
            disabled={!previews.length || analyzing}
            loading={analyzing}
          >
            {analyzing
              ? 'Analyzing...'
              : `Analyze Receipt${previews.length > 1 ? ` (${previews.length} images)` : ''}`}
          </RadixButton>
        </>
      ) : (
        <>
          <div>
            <Text size="1" weight="medium" as="p" mb="1">
              Item Name
            </Text>
            <TextField.Root
              placeholder="e.g. Organic Whole Milk 1L"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div>
            <Text size="1" weight="medium" as="p" mb="1">
              Price
            </Text>
            <TextField.Root
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={manualPrice}
              onChange={e => setManualPrice(e.target.value)}
            />
          </div>
          <div>
            <Text size="1" weight="medium" as="p" mb="1">
              Category (optional)
            </Text>
            <TextField.Root
              placeholder="e.g. Dairy, Produce"
              value={category}
              onChange={e => setCategory(e.target.value)}
            />
          </div>
          <div>
            <Text size="1" weight="medium" as="p" mb="1">
              Unit (optional)
            </Text>
            <TextField.Root
              placeholder="e.g. kg, each, L"
              value={unit}
              onChange={e => setUnit(e.target.value)}
            />
          </div>
          <div>
            <Text size="1" weight="medium" as="p" mb="1">
              Store (optional)
            </Text>
            <TextField.Root
              placeholder="e.g. Costco"
              value={manualStore}
              onChange={e => setManualStore(e.target.value)}
            />
          </div>
          <div>
            <Text size="1" weight="medium" as="p" mb="1">
              Purchase Date
            </Text>
            <TextField.Root
              type="date"
              value={manualDate}
              onChange={e => setManualDate(e.target.value)}
            />
          </div>
          <Button onClick={handleSubmitManual}>Save Item</Button>
        </>
      )}
    </Flex>
  );
};

export default function PriceTrackerPage() {
  const router = useRouter();
  const session = useAuth();
  const [homes, setHomes] = useState<HomeOption[]>([]);
  const [selectedHome, setSelectedHome] = useState<HomeOption | null>(null);
  const [items, setItems] = useState<PriceItem[]>([]);
  const [query, setQuery] = useState('');
  const [loaded, setLoaded] = useState(false);

  const authHeader = () => ({
    Authorization: `Bearer ${session?.access_token ?? ''}`,
  });

  useEffect(() => {
    supabase
      .from('homes')
      .select('id, name')
      .then(({ data }) => {
        const userHomes = data ?? [];
        if (userHomes.length === 0) {
          router.replace(ROUTES.HOMES);
          return;
        }
        setHomes(userHomes);
        setSelectedHome(userHomes[0]);
      });
  }, [router]);

  useEffect(() => {
    if (!selectedHome) return;
    setLoaded(false);
    fetch(`/api/price-tracker?homeId=${selectedHome.id}`, {
      headers: authHeader(),
    })
      .then(r => r.json())
      .then(data => {
        setItems(Array.isArray(data) ? data : []);
        setLoaded(true);
      });
  }, [selectedHome, session?.access_token]);

  const createItem = async (
    form: PriceItemFormValues & {
      entries: ({
        name?: string;
        category?: string | null;
        unit?: string | null;
      } & PriceItemFormValues['entries'][number])[];
    },
  ): Promise<PriceItemFormValues> => {
    const userId = session?.user.id ?? '';
    const accessToken = session?.access_token ?? '';

    if (
      form.entries.length > 0 &&
      (form.entries[0] as { name?: string }).name
    ) {
      const receiptEntries = form.entries as {
        name: string;
        category: string | null;
        unit: string | null;
        price: number;
        store: string | null;
        purchasedAt: string;
      }[];

      await Promise.all(
        receiptEntries.map(entry =>
          fetch('/api/price-tracker', {
            method: 'POST',
            headers: {
              ...authHeader(),
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: entry.name,
              category: entry.category,
              unit: entry.unit,
              homeId: selectedHome?.id,
              userId,
              entries: [
                {
                  price: entry.price,
                  store: entry.store,
                  purchasedAt: entry.purchasedAt,
                },
              ],
            }),
          }),
        ),
      );
    } else {
      await fetch('/api/price-tracker', {
        method: 'POST',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          category: form.category,
          unit: form.unit,
          homeId: selectedHome?.id,
          userId,
          accessToken,
          entries: form.entries,
        }),
      });
    }

    const res = await fetch(`/api/price-tracker?homeId=${selectedHome?.id}`, {
      headers: authHeader(),
    });
    const updated: PriceItem[] = await res.json();
    setItems(updated);
    return DEFAULT_FORM;
  };

  const updateItem = async (form: PriceItemFormValues): Promise<void> => {
    await fetch('/api/price-tracker', {
      method: 'PATCH',
      headers: { ...authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: form.id,
        name: form.name,
        category: form.category,
        unit: form.unit,
      }),
    });
  };

  const deleteItem = async (id: string | number) => {
    await fetch('/api/price-tracker', {
      method: 'DELETE',
      headers: { ...authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
  };

  if (homes.length === 0) return null;

  const filtered = items.filter(item => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return [item.name, item.category ?? '', item.unit ?? '']
      .join(' ')
      .toLowerCase()
      .includes(q);
  });

  const formItems = filtered.map(item => ({
    id: item.id,
    name: item.name,
    category: item.category,
    unit: item.unit,
    entries: item.entries.map(e => ({
      price: e.price,
      store: e.store,
      purchasedAt: e.purchasedAt,
    })),
    imageUrls: [] as string[],
    homeId: item.homeId,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }));

  return (
    <div className="max-w-3xl mx-auto p-2 sm:p-6 space-y-6">
      <Flex gap="2" align="center" wrap="wrap">
        <Select
          selectedOption={selectedHome ?? undefined}
          setValue={setSelectedHome}
          options={homes}
          optionDisplayKey="name"
          placeholder="Select a home"
        />
      </Flex>

      {selectedHome !== null && loaded && (
        <>
          <TextField.Root
            placeholder="Search items..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            size="3"
          />
          <CRUDItemList
            items={formItems as never}
            setItems={setItems as never}
            createItem={createItem as never}
            createItemFormDefaultValues={DEFAULT_FORM}
            updateItem={updateItem as never}
            deleteItem={deleteItem}
            FormComponent={PriceItemForm as never}
            ListItemComponent={PriceItemListItem as never}
            copy={COPY}
          />
        </>
      )}
    </div>
  );
}
