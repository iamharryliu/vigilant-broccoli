import { NextRequest } from 'next/server';
import {
  createServerClient,
  getBearerToken,
} from '../../../../../libs/supabase-server';
import { uploadImage } from '../r2';
import { saveThumbnail } from '../save-steps';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';

export const runtime = 'nodejs';

interface ImportImage {
  base64: string;
  mimeType: string;
  sortOrder: number;
}

interface ImportItem {
  title: string;
  description: string;
  tags: string[];
  room?: string | null;
  createdAt: string;
  images: ImportImage[];
}

// `rooms` and `room` are optional so exports made before rooms still import.
interface WhereIsImport {
  version: number;
  rooms?: string[];
  items: ImportItem[];
}

const toRoomKey = (name: string) => name.trim().toLowerCase();

// Matches rooms case-insensitively within the target home and creates missing ones.
const resolveRoomIds = async (
  supabase: ReturnType<typeof createServerClient>,
  importData: WhereIsImport,
  homeId: number,
  userId: string,
) => {
  const { data: existing } = await supabase
    .from('where_is_rooms')
    .select('id, name')
    .eq('home_id', homeId);
  const roomIdByKey = new Map<string, string>(
    (existing ?? []).map(room => [toRoomKey(room.name), room.id]),
  );

  const missing = new Map<string, string>();
  [
    ...(importData.rooms ?? []),
    ...importData.items.map(item => item.room ?? ''),
  ].forEach(name => {
    const key = toRoomKey(name);
    if (key && !roomIdByKey.has(key) && !missing.has(key))
      missing.set(key, name.trim());
  });

  if (missing.size) {
    const { data: created } = await supabase
      .from('where_is_rooms')
      .insert(
        [...missing.values()].map(name => ({
          name,
          home_id: homeId,
          user_id: userId,
        })),
      )
      .select('id, name');
    (created ?? []).forEach(room =>
      roomIdByKey.set(toRoomKey(room.name), room.id),
    );
  }

  return (name?: string | null) =>
    roomIdByKey.get(toRoomKey(name ?? '')) ?? null;
};

export async function POST(request: NextRequest) {
  const { importData, homeId, userId } = (await request.json()) as {
    importData: WhereIsImport;
    homeId: number;
    userId: string;
  };
  const supabase = createServerClient(getBearerToken(request));

  const MAX_IMPORT_ITEMS = 500;

  if (!importData?.items?.length) {
    return Response.json(
      { error: 'No items to import.' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  if (importData.items.length > MAX_IMPORT_ITEMS) {
    return Response.json(
      { error: `Cannot import more than ${MAX_IMPORT_ITEMS} items at once.` },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  const roomIdFor = await resolveRoomIds(supabase, importData, homeId, userId);
  let imported = 0;

  for (const item of importData.items) {
    const { data: inserted, error: insertError } = await supabase
      .from('where_is_items')
      .insert({
        title: item.title,
        description: item.description,
        tags: item.tags,
        room_id: roomIdFor(item.room),
        user_id: userId,
        home_id: homeId,
      })
      .select()
      .single();

    if (insertError || !inserted) continue;

    for (let i = 0; i < item.images.length; i++) {
      const img = item.images[i];
      const buffer = Buffer.from(img.base64, 'base64');
      const r2Key = `where-is/${inserted.id}/${crypto.randomUUID()}.jpg`;
      const [thumbnailKey] = await Promise.all([
        saveThumbnail(r2Key, { buffer, mimeType: img.mimeType }),
        uploadImage(r2Key, buffer, img.mimeType),
      ]);
      await supabase.from('where_is_images').insert({
        item_id: inserted.id,
        r2_key: r2Key,
        thumbnail_r2_key: thumbnailKey,
        mime_type: img.mimeType,
        sort_order: img.sortOrder ?? i,
      });
    }

    imported++;
  }

  return Response.json({ success: true, imported });
}
