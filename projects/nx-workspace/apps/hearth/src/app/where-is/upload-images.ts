import { PreviewImage } from './where-is-form';

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

  const mintRes = await fetch('/api/where-is/upload-url', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      count: previews.length,
      mimeType: previews[0].mimeType,
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
