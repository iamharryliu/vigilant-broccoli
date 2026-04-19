import { NextRequest } from 'next/server';
import { createServerClient } from '../../../../../libs/supabase-server';
import { getImageUrl } from '../r2';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';

export const runtime = 'nodejs';

interface ExportItem {
  title: string;
  description: string;
  tags: string[];
  createdAt: string;
  images: { base64: string; mimeType: string; sortOrder: number }[];
}

export interface WhereIsExport {
  version: 1;
  exportedAt: string;
  homeId: number;
  items: ExportItem[];
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const homeId = searchParams.get('homeId');
  const accessToken =
    request.headers.get('authorization')?.replace('Bearer ', '') ?? '';
  const supabase = createServerClient(accessToken);

  if (!homeId) {
    return Response.json(
      { error: 'homeId is required.' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  const { data: items } = await supabase
    .from('where_is_items')
    .select('*, where_is_images(*)')
    .eq('home_id', homeId)
    .order('created_at', { ascending: false });

  const exportItems: ExportItem[] = await Promise.all(
    (items ?? []).map(async item => {
      const sortedImages = (
        item.where_is_images as {
          r2_key: string;
          mime_type: string;
          sort_order: number;
        }[]
      ).sort((a, b) => a.sort_order - b.sort_order);

      const images = await Promise.all(
        sortedImages.map(async img => {
          const url = getImageUrl(img.r2_key);
          const res = await fetch(url);
          const buffer = Buffer.from(await res.arrayBuffer());
          return {
            base64: buffer.toString('base64'),
            mimeType: img.mime_type,
            sortOrder: img.sort_order,
          };
        }),
      );

      return {
        title: item.title,
        description: item.description,
        tags: item.tags,
        createdAt: item.created_at,
        images,
      };
    }),
  );

  const exportData: WhereIsExport = {
    version: 1,
    exportedAt: new Date().toISOString(),
    homeId: Number(homeId),
    items: exportItems,
  };

  return new Response(JSON.stringify(exportData), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="where-is-export-${homeId}-${Date.now()}.json"`,
    },
  });
}
