import { NextRequest } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import {
  createServerClient,
  getBearerToken,
} from '../../../../libs/supabase-server';
import {
  deleteImage,
  getImageUrl,
  readImage,
  uploadImage,
  RECEIPT_KEY_PREFIX,
  STAGING_KEY_PREFIX,
} from './r2';
import {
  processImage,
  validateImageCount,
  ImageValidationError,
} from './image-processor';
import { MAX_IMAGE_SIZE_BYTES } from './limits';

export const runtime = 'nodejs';

const TABLE = {
  RECEIPTS: 'receipts',
  MERCHANTS: 'receipt_merchants',
  ITEMS: 'receipt_items',
  TAXES: 'receipt_taxes',
  IMAGES: 'receipt_images',
  PRICE_ITEMS: 'price_items',
  PRICE_ENTRIES: 'price_entries',
} as const;

const ERROR_MISSING_ID = 'Missing id.';
const ERROR_CREATE_FAILED = 'Failed to create receipt.';
const RECEIPT_IMAGES_SELECT =
  '*, receipt_merchants(id, name, address), receipt_items(*), receipt_images(*), receipt_taxes(*)';

type SupabaseClient = ReturnType<typeof createServerClient>;

interface ReceiptItemInput {
  name: string;
  originalName: string | null;
  category: string | null;
  unit: string | null;
  quantity: number;
  unitPrice: number | null;
  totalPrice: number;
}

interface ReceiptTaxInput {
  rate: number;
  taxAmount: number | null;
  netAmount: number | null;
  grossAmount: number | null;
}

interface StagedImageRef {
  key: string;
  mimeType: string;
}

const normalizeName = (name: string) =>
  name.trim().toLowerCase().replace(/\s+/g, ' ');

const assertStagedKey = (key: string) => {
  if (!key.startsWith(STAGING_KEY_PREFIX))
    throw new ImageValidationError('Invalid staged image reference.');
};

const toItem = (row: Record<string, unknown>) => ({
  id: row.id as string,
  name: row.name as string,
  originalName: (row.original_name ?? null) as string | null,
  category: (row.category ?? null) as string | null,
  unit: (row.unit ?? null) as string | null,
  quantity: Number(row.quantity),
  unitPrice: row.unit_price === null ? null : Number(row.unit_price),
  totalPrice: Number(row.total_price),
  priceItemId: (row.price_item_id ?? null) as string | null,
  lineOrder: row.line_order as number,
});

const toTax = (row: Record<string, unknown>) => ({
  id: row.id as string,
  rate: Number(row.rate),
  taxAmount: row.tax_amount === null ? null : Number(row.tax_amount),
  netAmount: row.net_amount === null ? null : Number(row.net_amount),
  grossAmount: row.gross_amount === null ? null : Number(row.gross_amount),
});

const toReceipt = async (
  row: Record<string, unknown> & {
    receipt_merchants?: Record<string, unknown> | null;
    receipt_items?: Record<string, unknown>[];
    receipt_images?: Record<string, unknown>[];
    receipt_taxes?: Record<string, unknown>[];
  },
  withImageUrls: boolean,
) => {
  const images = (row.receipt_images ?? []).sort(
    (a, b) => (a.sort_order as number) - (b.sort_order as number),
  );

  return {
    id: row.id as string,
    homeId: row.home_id as number,
    merchantId: (row.merchant_id ?? null) as string | null,
    merchantName: (row.receipt_merchants?.name ?? null) as string | null,
    merchantAddress: (row.receipt_merchants?.address ?? null) as string | null,
    purchasedAt: row.purchased_at as string,
    currency: row.currency as string,
    taxInclusive: row.tax_inclusive as boolean,
    subtotal: row.subtotal === null ? null : Number(row.subtotal),
    tax: row.tax === null ? null : Number(row.tax),
    total: row.total === null ? null : Number(row.total),
    notes: (row.notes ?? null) as string | null,
    items: (row.receipt_items ?? [])
      .map(toItem)
      .sort((a, b) => a.lineOrder - b.lineOrder),
    taxes: (row.receipt_taxes ?? []).map(toTax).sort((a, b) => b.rate - a.rate),
    imageKeys: images.map(img => img.r2_key as string),
    imageUrls: withImageUrls
      ? await Promise.all(images.map(img => getImageUrl(img.r2_key as string)))
      : [],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
};

const resolveMerchantId = async (
  supabase: SupabaseClient,
  merchantName: string | null,
  merchantAddress: string | null,
  homeId: number,
  userId: string,
) => {
  if (!merchantName?.trim()) return null;

  const normalized = normalizeName(merchantName);
  const { data: existing } = await supabase
    .from(TABLE.MERCHANTS)
    .select('id')
    .eq('home_id', homeId)
    .eq('normalized_name', normalized)
    .maybeSingle();

  if (existing) return existing.id as string;

  const { data: created } = await supabase
    .from(TABLE.MERCHANTS)
    .insert({
      name: merchantName.trim(),
      normalized_name: normalized,
      address: merchantAddress?.trim() || null,
      home_id: homeId,
      user_id: userId,
    })
    .select('id')
    .single();

  return (created?.id ?? null) as string | null;
};

// Keeps the existing Price Tracker fed from receipt scans: every line item
// resolves to a price_items row for the home, and each scan appends a
// price_entries observation at unit price so history stays comparable.
const linkPriceItem = async (
  supabase: SupabaseClient,
  item: ReceiptItemInput,
  merchantName: string | null,
  purchasedAt: string,
  homeId: number,
  userId: string,
) => {
  const { data: existing } = await supabase
    .from(TABLE.PRICE_ITEMS)
    .select('id')
    .eq('home_id', homeId)
    .ilike('name', item.name.trim())
    .limit(1)
    .maybeSingle();

  const priceItemId =
    (existing?.id as string | undefined) ??
    ((
      await supabase
        .from(TABLE.PRICE_ITEMS)
        .insert({
          name: item.name.trim(),
          category: item.category,
          unit: item.unit,
          home_id: homeId,
          user_id: userId,
        })
        .select('id')
        .single()
    ).data?.id as string | undefined);

  if (!priceItemId) return null;

  await supabase.from(TABLE.PRICE_ENTRIES).insert({
    item_id: priceItemId,
    price: item.unitPrice ?? item.totalPrice,
    store: merchantName,
    purchased_at: purchasedAt,
  });

  return priceItemId;
};

const saveStagedImages = async (
  supabase: SupabaseClient,
  receiptId: string,
  images: StagedImageRef[],
  startSortOrder: number,
) => {
  images.forEach(img => assertStagedKey(img.key));

  const processed = await Promise.all(
    images.map(async img => {
      try {
        const buffer = await readImage(img.key, MAX_IMAGE_SIZE_BYTES);
        return await processImage({ buffer, mimeType: img.mimeType });
      } finally {
        await deleteImage(img.key).catch(() => undefined);
      }
    }),
  );

  await Promise.all(
    processed.map(async (img, index) => {
      const key = `${RECEIPT_KEY_PREFIX}/${receiptId}/${crypto.randomUUID()}.jpg`;
      await uploadImage(key, img.buffer, img.mimeType);
      await supabase.from(TABLE.IMAGES).insert({
        receipt_id: receiptId,
        r2_key: key,
        mime_type: img.mimeType,
        sort_order: startSortOrder + index,
      });
    }),
  );
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const homeId = searchParams.get('homeId');
  const id = searchParams.get('id');
  const supabase = createServerClient(getBearerToken(request));

  let query = supabase
    .from(TABLE.RECEIPTS)
    .select(RECEIPT_IMAGES_SELECT)
    .order('purchased_at', { ascending: false });

  if (id) query = query.eq('id', id);
  else if (homeId) query = query.eq('home_id', homeId);

  const { data, error } = await query;
  if (error) {
    return Response.json(
      { error: error.message },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }

  // Presigning every image on the list view would be a round trip per receipt,
  // so thumbnails are only resolved when a single receipt is requested.
  const mapped = await Promise.all(
    (data ?? []).map(row => toReceipt(row as never, Boolean(id))),
  );

  return Response.json(id ? (mapped[0] ?? null) : mapped);
}

export async function POST(request: NextRequest) {
  const supabase = createServerClient(getBearerToken(request));
  const {
    merchantName,
    merchantAddress,
    purchasedAt,
    currency,
    taxInclusive,
    subtotal,
    tax,
    total,
    notes,
    items,
    taxes,
    images,
    homeId,
    userId,
  } = (await request.json()) as {
    merchantName: string | null;
    merchantAddress: string | null;
    purchasedAt: string;
    currency: string;
    taxInclusive: boolean;
    subtotal: number | null;
    tax: number | null;
    total: number | null;
    notes: string | null;
    items: ReceiptItemInput[];
    taxes: ReceiptTaxInput[];
    images: StagedImageRef[];
    homeId: number;
    userId: string;
  };

  const merchantId = await resolveMerchantId(
    supabase,
    merchantName,
    merchantAddress,
    homeId,
    userId,
  );

  const { data: receipt, error: receiptError } = await supabase
    .from(TABLE.RECEIPTS)
    .insert({
      merchant_id: merchantId,
      purchased_at: purchasedAt,
      currency,
      tax_inclusive: taxInclusive,
      subtotal,
      tax,
      total,
      notes: notes || null,
      home_id: homeId,
      user_id: userId,
    })
    .select('id')
    .single();

  if (receiptError || !receipt) {
    return Response.json(
      { error: receiptError?.message ?? ERROR_CREATE_FAILED },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }

  const priceItemIds = await Promise.all(
    items.map(item =>
      linkPriceItem(supabase, item, merchantName, purchasedAt, homeId, userId),
    ),
  );

  const { error: itemsError } = await supabase.from(TABLE.ITEMS).insert(
    items.map((item, index) => ({
      receipt_id: receipt.id,
      price_item_id: priceItemIds[index],
      name: item.name,
      original_name: item.originalName ?? item.name,
      category: item.category,
      unit: item.unit,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: item.totalPrice,
      line_order: index,
    })),
  );

  if (itemsError) {
    return Response.json(
      { error: itemsError.message },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }

  if (taxes?.length) {
    await supabase.from(TABLE.TAXES).insert(
      taxes.map(t => ({
        receipt_id: receipt.id,
        rate: t.rate,
        tax_amount: t.taxAmount,
        net_amount: t.netAmount,
        gross_amount: t.grossAmount,
      })),
    );
  }

  if (images?.length) {
    try {
      validateImageCount(images);
      await saveStagedImages(supabase, receipt.id, images, 0);
    } catch (e) {
      if (e instanceof ImageValidationError) {
        return Response.json(
          { error: e.message },
          { status: HTTP_STATUS_CODES.BAD_REQUEST },
        );
      }
      throw e;
    }
  }

  return Response.json({ success: true, id: receipt.id });
}

export async function PATCH(request: NextRequest) {
  const supabase = createServerClient(getBearerToken(request));
  const {
    id,
    merchantName,
    merchantAddress,
    purchasedAt,
    currency,
    taxInclusive,
    subtotal,
    tax,
    total,
    notes,
    items,
    taxes,
    homeId,
    userId,
  } = (await request.json()) as {
    id: string;
    merchantName: string | null;
    merchantAddress: string | null;
    purchasedAt: string;
    currency: string;
    taxInclusive: boolean;
    subtotal: number | null;
    tax: number | null;
    total: number | null;
    notes: string | null;
    items: ReceiptItemInput[] | undefined;
    taxes: ReceiptTaxInput[] | undefined;
    homeId: number;
    userId: string;
  };

  if (!id) {
    return Response.json(
      { error: ERROR_MISSING_ID },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  const merchantId = await resolveMerchantId(
    supabase,
    merchantName,
    merchantAddress,
    homeId,
    userId,
  );

  const { error } = await supabase
    .from(TABLE.RECEIPTS)
    .update({
      merchant_id: merchantId,
      purchased_at: purchasedAt,
      currency,
      tax_inclusive: taxInclusive,
      subtotal,
      tax,
      total,
      notes: notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    return Response.json(
      { error: error.message },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }

  // Line items are replaced wholesale — the edit form always submits the full
  // set, so diffing rows would add bookkeeping without changing the result.
  if (items) {
    await supabase.from(TABLE.ITEMS).delete().eq('receipt_id', id);
    await supabase.from(TABLE.ITEMS).insert(
      items.map((item, index) => ({
        receipt_id: id,
        name: item.name,
        original_name: item.originalName ?? item.name,
        category: item.category,
        unit: item.unit,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.totalPrice,
        line_order: index,
      })),
    );
  }

  if (taxes) {
    await supabase.from(TABLE.TAXES).delete().eq('receipt_id', id);
    if (taxes.length) {
      await supabase.from(TABLE.TAXES).insert(
        taxes.map(t => ({
          receipt_id: id,
          rate: t.rate,
          tax_amount: t.taxAmount,
          net_amount: t.netAmount,
          gross_amount: t.grossAmount,
        })),
      );
    }
  }

  return Response.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const supabase = createServerClient(getBearerToken(request));
  const { id } = (await request.json()) as { id: string };

  if (!id) {
    return Response.json(
      { error: ERROR_MISSING_ID },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  const { data: images } = await supabase
    .from(TABLE.IMAGES)
    .select('r2_key')
    .eq('receipt_id', id);

  const { error } = await supabase.from(TABLE.RECEIPTS).delete().eq('id', id);

  if (error) {
    return Response.json(
      { error: error.message },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }

  await Promise.allSettled(
    (images ?? []).map(img => deleteImage(img.r2_key as string)),
  );

  return Response.json({ success: true });
}
