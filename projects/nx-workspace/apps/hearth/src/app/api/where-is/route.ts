import { NextRequest } from 'next/server';
import {
  createServerClient,
  getBearerToken,
} from '../../../../libs/supabase-server';
import { uploadImage, deleteImage, readImage, getImageUrls } from './r2';
import {
  processImage,
  validateImageCount,
  ImageValidationError,
} from './image-processor';
import {
  PROCESS_TIMEOUT_MS,
  SAVE_STEP,
  SaveStepError,
  runStep,
  saveThumbnail,
  withTimeout,
} from './save-steps';
import { MAX_IMAGE_SIZE_BYTES } from './limits';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';

export const runtime = 'nodejs';

const MAX_REQUEST_BYTES = 1 * 1024 * 1024;
const ERROR_REQUEST_TOO_LARGE = 'Request too large.';
const STAGING_KEY_PREFIX = 'staging/where-is/';

interface StagedImageRef {
  key: string;
  mimeType: string;
}

interface StoredImage {
  r2_key: string;
  thumbnail_r2_key: string | null;
  sort_order: number;
}

const makeR2Key = (itemId: string) =>
  `where-is/${itemId}/${crypto.randomUUID()}.jpg`;

const assertStagedKey = (key: string) => {
  if (!key.startsWith(STAGING_KEY_PREFIX))
    throw new ImageValidationError('Invalid staged image reference.');
};

const saveErrorResponse = (e: unknown) => {
  if (e instanceof ImageValidationError) {
    return Response.json(
      { error: e.message },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }
  if (e instanceof SaveStepError) {
    return Response.json(
      {
        error: e.timedOut
          ? `Saving timed out during the ${e.step} step. Please try again.`
          : `Saving failed during the ${e.step} step. Please try again.`,
        step: e.step,
      },
      {
        status: e.timedOut
          ? HTTP_STATUS_CODES.GATEWAY_TIMEOUT
          : HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      },
    );
  }
  throw e;
};

const readAndProcessStagedImages = async (images: StagedImageRef[]) => {
  images.forEach(img => assertStagedKey(img.key));
  return Promise.all(
    images.map(async img => {
      try {
        const buffer = await runStep(SAVE_STEP.READ, img.key, () =>
          readImage(img.key, MAX_IMAGE_SIZE_BYTES),
        );
        return await runStep(SAVE_STEP.PROCESS, img.key, () =>
          withTimeout(
            processImage({ buffer, mimeType: img.mimeType }),
            PROCESS_TIMEOUT_MS,
          ),
        );
      } finally {
        await runStep(SAVE_STEP.DELETE_STAGED, img.key, () =>
          deleteImage(img.key),
        ).catch(() => undefined);
      }
    }),
  );
};

const deleteStoredImages = (images: Omit<StoredImage, 'sort_order'>[]) =>
  Promise.allSettled(
    images.flatMap(img => [
      deleteImage(img.r2_key),
      ...(img.thumbnail_r2_key ? [deleteImage(img.thumbnail_r2_key)] : []),
    ]),
  );

const saveFinalImages = (
  supabase: ReturnType<typeof createServerClient>,
  itemId: string,
  processedImages: Awaited<ReturnType<typeof processImage>>[],
  firstSortOrder: number,
) =>
  Promise.all(
    processedImages.map((img, index) => {
      const r2Key = makeR2Key(itemId);
      return runStep(SAVE_STEP.UPLOAD_FINAL, r2Key, async () => {
        const [thumbnailKey] = await Promise.all([
          saveThumbnail(r2Key, img),
          uploadImage(r2Key, img.buffer, img.mimeType),
        ]);
        const { error } = await supabase.from('where_is_images').insert({
          item_id: itemId,
          r2_key: r2Key,
          thumbnail_r2_key: thumbnailKey,
          mime_type: img.mimeType,
          sort_order: firstSortOrder + index,
        });
        if (error) throw new Error(error.message);
      });
    }),
  );

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const homeId = searchParams.get('homeId');
  const id = searchParams.get('id');
  const supabase = createServerClient(getBearerToken(request));

  let query = supabase
    .from('where_is_items')
    .select('*, where_is_images(*)')
    .order('created_at', { ascending: false });

  if (id) query = query.eq('id', id);
  else if (homeId) query = query.eq('home_id', homeId);

  const { data: items } = await query;

  const rows = (items ?? []).map(item => ({
    item,
    images: (item.where_is_images as StoredImage[]).sort(
      (a, b) => a.sort_order - b.sort_order,
    ),
  }));
  // A list row shows one thumbnail, so only a single item's request signs its
  // full-size images; rows saved before thumbnails fall back to the full image.
  const coverKey = (images: StoredImage[]) =>
    images[0] ? (images[0].thumbnail_r2_key ?? images[0].r2_key) : null;
  const fullKeys = id
    ? rows.flatMap(row => row.images.map(img => img.r2_key))
    : [];
  const coverKeys = rows
    .map(row => coverKey(row.images))
    .filter((key): key is string => key !== null);

  try {
    const keys = [...new Set([...fullKeys, ...coverKeys])];
    const signed = await getImageUrls(keys);
    const urlByKey = new Map(keys.map((key, i) => [key, signed[i]]));

    const result = rows.map(({ item, images }) => {
      const cover = coverKey(images);
      return {
        id: item.id,
        title: item.title,
        description: item.description,
        tags: item.tags,
        homeId: item.home_id,
        imageUrls: id ? images.map(img => urlByKey.get(img.r2_key) ?? '') : [],
        imageKeys: images.map(img => img.r2_key),
        thumbnailUrl: cover ? (urlByKey.get(cover) ?? null) : null,
        createdAt: item.created_at,
      };
    });

    return Response.json(id ? (result[0] ?? null) : result);
  } catch (e) {
    return Response.json(
      { error: (e as Error).message },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (contentLength > MAX_REQUEST_BYTES) {
    return Response.json(
      { error: ERROR_REQUEST_TOO_LARGE },
      { status: HTTP_STATUS_CODES.PAYLOAD_TOO_LARGE },
    );
  }

  const { title, description, tags, images, homeId, userId } =
    (await request.json()) as {
      title: string;
      description: string;
      tags: string[];
      images: StagedImageRef[];
      homeId: number;
      userId: string;
    };
  const supabase = createServerClient(getBearerToken(request));

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
    processedImages = await readAndProcessStagedImages(images);
  } catch (e) {
    return saveErrorResponse(e);
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

  try {
    await saveFinalImages(supabase, item.id, processedImages, 0);
  } catch (e) {
    // where_is_images cascades on item delete; removing the row keeps a retry from duplicating it.
    await supabase
      .from('where_is_items')
      .delete()
      .eq('id', item.id)
      .then(undefined, () => undefined);
    return saveErrorResponse(e);
  }

  return Response.json({ success: true, id: item.id });
}

export async function PATCH(request: NextRequest) {
  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (contentLength > MAX_REQUEST_BYTES) {
    return Response.json(
      { error: ERROR_REQUEST_TOO_LARGE },
      { status: HTTP_STATUS_CODES.PAYLOAD_TOO_LARGE },
    );
  }

  const {
    id,
    title,
    description,
    tags,
    removedImageKeys,
    imageKeyOrder,
    newImages,
  } = (await request.json()) as {
    id: string;
    title: string;
    description: string;
    tags: string[];
    removedImageKeys: string[];
    imageKeyOrder?: string[];
    newImages: StagedImageRef[];
  };
  const supabase = createServerClient(getBearerToken(request));

  const { error } = await supabase
    .from('where_is_items')
    .update({ title, description, tags })
    .eq('id', id);

  if (error) {
    return Response.json(
      { error: error.message },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }

  if (removedImageKeys?.length) {
    const { data: allImages } = await supabase
      .from('where_is_images')
      .select('id, r2_key, thumbnail_r2_key')
      .eq('item_id', id);

    const removed = new Set(removedImageKeys);
    const toRemove = (allImages ?? []).filter(img => removed.has(img.r2_key));

    if (toRemove.length) {
      await supabase
        .from('where_is_images')
        .delete()
        .in(
          'id',
          toRemove.map(img => img.id),
        );
      await deleteStoredImages(toRemove);
    }
  }

  if (imageKeyOrder?.length) {
    // Scoped by item_id so a key from another item is never touched.
    const results = await Promise.all(
      imageKeyOrder.map((r2Key, sortOrder) =>
        supabase
          .from('where_is_images')
          .update({ sort_order: sortOrder })
          .eq('item_id', id)
          .eq('r2_key', r2Key),
      ),
    );
    const orderError = results.find(r => r.error)?.error;
    if (orderError) {
      return Response.json(
        { error: orderError.message },
        { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
      );
    }
  }

  if (newImages?.length) {
    let processedImages: Awaited<ReturnType<typeof processImage>>[];
    try {
      validateImageCount(newImages);
      processedImages = await readAndProcessStagedImages(newImages);
    } catch (e) {
      return saveErrorResponse(e);
    }

    const { data: existingImages } = await supabase
      .from('where_is_images')
      .select('sort_order')
      .eq('item_id', id)
      .order('sort_order', { ascending: false })
      .limit(1);

    const nextSortOrder =
      ((existingImages?.[0]?.sort_order ?? -1) as number) + 1;

    try {
      await saveFinalImages(supabase, id, processedImages, nextSortOrder);
    } catch (e) {
      return saveErrorResponse(e);
    }
  }

  return Response.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json();
  const supabase = createServerClient(getBearerToken(request));

  const { data: images } = await supabase
    .from('where_is_images')
    .select('r2_key, thumbnail_r2_key')
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

  await deleteStoredImages(images ?? []);

  return Response.json({ success: true });
}
