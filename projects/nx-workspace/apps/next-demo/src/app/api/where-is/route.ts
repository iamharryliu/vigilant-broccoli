import { NextRequest } from 'next/server';
import { createServerClient } from '../../../../libs/supabase-server';
import { uploadImage, deleteImage, getImageUrl } from './r2';
import {
  processImage,
  validateImageCount,
  ImageValidationError,
  RawImage,
} from './image-processor';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';

export const runtime = 'nodejs';

const MAX_REQUEST_BYTES = 50 * 1024 * 1024; // 50MB — 10 images × ~5MB each

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const homeId = searchParams.get('homeId');
  const accessToken =
    request.headers.get('authorization')?.replace('Bearer ', '') ?? '';
  const supabase = createServerClient(accessToken);

  let query = supabase
    .from('where_is_items')
    .select('*, where_is_images(*)')
    .order('created_at', { ascending: false });

  if (homeId) query = query.eq('home_id', homeId);

  const { data: items } = await query;

  const result = (items ?? []).map(item => ({
    id: item.id,
    title: item.title,
    description: item.description,
    tags: item.tags,
    homeId: item.home_id,
    imageUrls: (
      item.where_is_images as { r2_key: string; sort_order: number }[]
    )
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(img => getImageUrl(img.r2_key)),
    createdAt: item.created_at,
  }));

  return Response.json(result);
}

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (contentLength > MAX_REQUEST_BYTES) {
    return Response.json({ error: 'Request too large.' }, { status: 413 });
  }

  const { title, description, tags, images, homeId, userId, accessToken } =
    (await request.json()) as {
      title: string;
      description: string;
      tags: string[];
      images: RawImage[];
      homeId: number;
      userId: string;
      accessToken: string;
    };
  const supabase = createServerClient(accessToken);

  try {
    validateImageCount(images);
  } catch (e) {
    return Response.json(
      { error: (e as Error).message },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  let processedImages: Awaited<ReturnType<typeof processImage>>[];
  try {
    processedImages = await Promise.all(images.map(processImage));
  } catch (e) {
    if (e instanceof ImageValidationError) {
      return Response.json(
        { error: e.message },
        { status: HTTP_STATUS_CODES.BAD_REQUEST },
      );
    }
    throw e;
  }

  const { data: item, error: insertError } = await supabase
    .from('where_is_items')
    .insert({ title, description, tags, user_id: userId, home_id: homeId })
    .select()
    .single();

  if (insertError || !item) {
    return Response.json(
      { error: insertError?.message ?? 'Failed to create item.' },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }

  await Promise.all(
    processedImages.map(async (img, index) => {
      const r2Key = `where-is/${item.id}/${crypto.randomUUID()}.jpg`;
      await uploadImage(r2Key, img.buffer, img.mimeType);
      await supabase.from('where_is_images').insert({
        item_id: item.id,
        r2_key: r2Key,
        mime_type: img.mimeType,
        sort_order: index,
      });
    }),
  );

  return Response.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const { id, accessToken } = await request.json();
  const supabase = createServerClient(accessToken ?? '');

  const { data: images } = await supabase
    .from('where_is_images')
    .select('r2_key')
    .eq('item_id', id);

  const { error: deleteError } = await supabase
    .from('where_is_items')
    .delete()
    .eq('id', id);

  if (deleteError) {
    return Response.json(
      { error: deleteError.message },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }

  await Promise.allSettled((images ?? []).map(img => deleteImage(img.r2_key)));

  return Response.json({ success: true });
}
