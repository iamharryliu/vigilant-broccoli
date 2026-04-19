import { NextRequest } from 'next/server';
import { createServerClient } from '../../../../../libs/supabase-server';
import { uploadImage } from '../r2';
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
  createdAt: string;
  images: ImportImage[];
}

interface WhereIsImport {
  version: number;
  items: ImportItem[];
}

export async function POST(request: NextRequest) {
  const { importData, homeId, userId, accessToken } =
    (await request.json()) as {
      importData: WhereIsImport;
      homeId: number;
      userId: string;
      accessToken: string;
    };
  const supabase = createServerClient(accessToken);

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

  let imported = 0;

  for (const item of importData.items) {
    const { data: inserted, error: insertError } = await supabase
      .from('where_is_items')
      .insert({
        title: item.title,
        description: item.description,
        tags: item.tags,
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
      await uploadImage(r2Key, buffer, img.mimeType);
      await supabase.from('where_is_images').insert({
        item_id: inserted.id,
        r2_key: r2Key,
        mime_type: img.mimeType,
        sort_order: img.sortOrder ?? i,
      });
    }

    imported++;
  }

  return Response.json({ success: true, imported });
}
