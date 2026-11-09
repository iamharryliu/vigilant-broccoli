import { PreviewImage } from './where-is-form';
import { MAX_IMAGE_SIZE_BYTES } from '../api/where-is/limits';

export interface StagedImageRef {
  key: string;
  mimeType: string;
}

interface UploadTarget {
  key: string;
  uploadUrl: string;
  mimeType: string;
}

const ERROR_SAVE = 'Saving failed. Please try again.';
const ERROR_UPLOAD = 'Image upload failed. Please try again.';

// A Vercel 504 body is HTML, so the JSON parse must not throw.
export const throwIfNotOk = async (
  res: Response,
  fallback: string = ERROR_SAVE,
) => {
  if (res.ok) return;
  const body = (await res.json().catch(() => null)) as {
    error?: string;
  } | null;
  throw new Error(body?.error ?? fallback);
};

export const uploadPreviewImages = async (
  previews: PreviewImage[],
  accessToken: string,
): Promise<StagedImageRef[]> => {
  if (!previews.length) return [];

  const oversized = previews.find(p => p.blob.size > MAX_IMAGE_SIZE_BYTES);
  if (oversized) {
    throw new Error(
      `Image exceeds the ${MAX_IMAGE_SIZE_BYTES / 1024 / 1024}MB limit.`,
    );
  }

  const mintRes = await fetch('/api/where-is/upload-url', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      images: previews.map(p => ({ mimeType: p.mimeType, size: p.blob.size })),
    }),
  });
  await throwIfNotOk(mintRes, ERROR_UPLOAD);
  const { targets } = (await mintRes.json()) as { targets: UploadTarget[] };

  await Promise.all(
    targets.map(async (target, i) => {
      const put = await fetch(target.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': target.mimeType },
        body: previews[i].blob,
      });
      if (!put.ok) throw new Error(ERROR_UPLOAD);
    }),
  );

  return targets.map(({ key, mimeType }) => ({ key, mimeType }));
};
