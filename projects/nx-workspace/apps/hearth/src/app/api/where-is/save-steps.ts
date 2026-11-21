import { uploadImage, toThumbnailKey } from './r2';
import {
  createThumbnail,
  StagedImage,
  ImageValidationError,
} from './image-processor';

export const PROCESS_TIMEOUT_MS = 20_000;
const TIMEOUT_ERROR_NAME = 'TimeoutError';

export const SAVE_STEP = {
  READ: 'read',
  PROCESS: 'process',
  THUMBNAIL: 'thumbnail',
  DELETE_STAGED: 'delete-staged',
  UPLOAD_FINAL: 'upload-final',
} as const;
type SaveStep = (typeof SAVE_STEP)[keyof typeof SAVE_STEP];

export class SaveStepError extends Error {
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
export const runStep = async <T>(
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
    // A constant format string keeps `%` sequences in the user-provided key literal.
    console.error(
      '%s %s',
      `[where-is] step=${step} key=${key} ${timedOut ? 'timeout' : 'failed'} durationMs=${Date.now() - startedAt}`,
      (e as Error).message,
    );
    throw new SaveStepError(step, timedOut, (e as Error).message);
  }
};

// The race stops the wait, not the underlying work, which keeps running until it settles.
export const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
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

// Best effort: a missing thumbnail only makes the list fall back to the full
// image, so its failure never fails the save.
export const saveThumbnail = (r2Key: string, image: StagedImage) => {
  const thumbnailKey = toThumbnailKey(r2Key);
  return runStep(SAVE_STEP.THUMBNAIL, thumbnailKey, async () => {
    const thumbnail = await withTimeout(
      createThumbnail(image),
      PROCESS_TIMEOUT_MS,
    );
    await uploadImage(thumbnailKey, thumbnail.buffer, thumbnail.mimeType);
    return thumbnailKey;
  }).catch(() => null);
};
