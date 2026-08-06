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
  const { targets } = (await mintRes.json()) as { targets: UploadTarget[] };

  await Promise.all(
    targets.map((target, i) =>
      fetch(target.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': target.mimeType },
        body: previews[i].blob,
      }),
    ),
  );

  return targets.map(({ key, mimeType }) => ({ key, mimeType }));
};
