import { NextRequest } from 'next/server';
import {
  createServerClient,
  getBearerToken,
} from '../../../../libs/supabase-server';
import { uploadImage, deleteImage, readImage, getImageUrl } from './r2';
import {
  processImage,
  validateImageCount,
  ImageValidationError,
} from './image-processor';
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

const makeR2Key = (itemId: string) =>
  `where-is/${itemId}/${crypto.randomUUID()}.jpg`;

const assertStagedKey = (key: string) => {
  if (!key.startsWith(STAGING_KEY_PREFIX))
    throw new ImageValidationError('Invalid staged image reference.');
};

const PROCESS_TIMEOUT_MS = 20_000;
const TIMEOUT_ERROR_NAME = 'TimeoutError';

const SAVE_STEP = {
  READ: 'read',
  PROCESS: 'process',
  DELETE_STAGED: 'delete-staged',
  UPLOAD_FINAL: 'upload-final',
} as const;
type SaveStep = (typeof SAVE_STEP)[keyof typeof SAVE_STEP];

class SaveStepError extends Error {
  constructor(
    readonly step: SaveStep,
    readonly timedOut: boolean,
    message: string,
  ) {
    super(message);
  }
}

const isTimeout = (e: unknown) =>
  e instanceof Error && e.name === TIMEOUT_ERROR_NAME;

// Only the key is logged: presigned URLs are bearer credentials.
const runStep = async <T>(
  step: SaveStep,
  key: string,
  fn: () => Promise<T>,
): Promise<T> => {
  const startedAt = Date.now();
  try {
    const result = await fn();
    console.info(
      `[where-is] step=${step} key=${key} ok durationMs=${Date.now() - startedAt}`,
    );
    return result;
  } catch (e) {
    if (e instanceof ImageValidationError) throw e;
    const timedOut = isTimeout(e);
    console.error(
      `[where-is] step=${step} key=${key} ${timedOut ? 'timeout' : 'failed'} durationMs=${Date.now() - startedAt}`,
      (e as Error).message,
    );
    throw new SaveStepError(step, timedOut, (e as Error).message);
  }
};

// The race stops the wait, not the underlying work, which keeps running until it settles.
const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      const error = new Error(`Timed out after ${ms}ms`);
      error.name = TIMEOUT_ERROR_NAME;
      reject(error);
    }, ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
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
        await uploadImage(r2Key, img.buffer, img.mimeType);
        const { error } = await supabase.from('where_is_images').insert({
          item_id: itemId,
          r2_key: r2Key,
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

  try {
    const result = await Promise.all(
      (items ?? []).map(async item => {
        const sortedImages = (
          item.where_is_images as { r2_key: string; sort_order: number }[]
        ).sort((a, b) => a.sort_order - b.sort_order);

        return {
          id: item.id,
          title: item.title,
          description: item.description,
          tags: item.tags,
          homeId: item.home_id,
          imageUrls: await Promise.all(
            sortedImages.map(img => getImageUrl(img.r2_key)),
          ),
          imageKeys: sortedImages.map(img => img.r2_key),
          createdAt: item.created_at,
        };
      }),
    );

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

  return Response.json({ success: true });
}

export async function PATCH(request: NextRequest) {
  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (contentLength > MAX_REQUEST_BYTES) {
    return Response.json(
      { error: ERROR_REQUEST_TOO_LARGE },
      { status: HTTP_STATUS_CODES.PAYLOAD_TOO_LARGE },
    );
  }

  const { id, title, description, tags, removedImageKeys, newImages } =
    (await request.json()) as {
      id: string;
      title: string;
      description: string;
      tags: string[];
      removedImageKeys: string[];
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
      .select('id, r2_key')
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
      await Promise.allSettled(toRemove.map(img => deleteImage(img.r2_key)));
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
