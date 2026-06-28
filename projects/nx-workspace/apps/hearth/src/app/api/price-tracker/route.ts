import { NextRequest } from 'next/server';
import { createServerClient } from '../../../../libs/supabase-server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';

export const runtime = 'nodejs';

const getSupabase = (req: NextRequest) => {
  const accessToken =
    req.headers.get('authorization')?.replace('Bearer ', '') ?? '';
  return createServerClient(accessToken);
};

const toEntry = (row: Record<string, unknown>) => ({
  id: row.id,
  price: row.price,
  store: row.store ?? null,
  purchasedAt: row.purchased_at,
  createdAt: row.created_at,
});

const toItem = (
  row: Record<string, unknown> & { price_entries?: Record<string, unknown>[] },
) => ({
  id: row.id,
  name: row.name,
  category: row.category ?? null,
  unit: row.unit ?? null,
  homeId: row.home_id,
  entries: (row.price_entries ?? []).map(toEntry),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const homeId = searchParams.get('homeId');
  const id = searchParams.get('id');
  const supabase = getSupabase(req);

  let query = supabase
    .from('price_items')
    .select('*, price_entries(*)')
    .order('name', { ascending: true });

  if (id) query = query.eq('id', id);
  else if (homeId) query = query.eq('home_id', homeId);

  const { data, error } = await query;
  if (error)
    return Response.json(
      { error: error.message },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );

  const mapped = (data ?? []).map(toItem);
  return Response.json(id ? (mapped[0] ?? null) : mapped);
}

export async function POST(req: NextRequest) {
  const supabase = getSupabase(req);
  const body = await req.json();

  const { name, category, unit, homeId, userId, entries } = body as {
    name: string;
    category: string | null;
    unit: string | null;
    homeId: number;
    userId: string;
    entries: { price: number; store: string | null; purchasedAt: string }[];
  };

  const { data: item, error: itemError } = await supabase
    .from('price_items')
    .insert({
      name,
      category: category || null,
      unit: unit || null,
      home_id: homeId,
      user_id: userId,
    })
    .select()
    .single();

  if (itemError || !item) {
    return Response.json(
      { error: itemError?.message ?? 'Failed to create item.' },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }

  if (entries.length > 0) {
    const { error: entryError } = await supabase.from('price_entries').insert(
      entries.map(e => ({
        item_id: item.id,
        price: e.price,
        store: e.store || null,
        purchased_at: e.purchasedAt,
      })),
    );
    if (entryError) {
      return Response.json(
        { error: entryError.message },
        { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
      );
    }
  }

  return Response.json({ success: true, id: item.id });
}

export async function PATCH(req: NextRequest) {
  const supabase = getSupabase(req);
  const body = await req.json();
  const { id, name, category, unit } = body as {
    id: string;
    name: string;
    category: string | null;
    unit: string | null;
  };

  if (!id)
    return Response.json(
      { error: 'Missing id' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );

  const { error } = await supabase
    .from('price_items')
    .update({ name, category: category || null, unit: unit || null })
    .eq('id', id);

  if (error)
    return Response.json(
      { error: error.message },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );

  return Response.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const supabase = getSupabase(req);
  const { id } = await req.json();

  if (!id)
    return Response.json(
      { error: 'Missing id' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );

  const { error } = await supabase.from('price_items').delete().eq('id', id);

  if (error)
    return Response.json(
      { error: error.message },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );

  return Response.json({ success: true });
}
