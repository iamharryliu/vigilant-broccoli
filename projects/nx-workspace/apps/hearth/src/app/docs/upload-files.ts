import { HomeDocFormData } from './components/HomeDocForm';

export interface StagedFileRef {
  key: string;
  mimeType: string;
  name: string;
}

interface UploadTarget {
  key: string;
  uploadUrl: string;
  mimeType: string;
}

export const uploadFormFiles = async (
  files: HomeDocFormData['files'],
  accessToken: string,
): Promise<StagedFileRef[]> => {
  if (!files.length) return [];

  const mintRes = await fetch('/api/docs/upload-url', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      files: files.map(f => ({ mimeType: f.mimeType })),
    }),
  });
  const { targets } = (await mintRes.json()) as { targets: UploadTarget[] };

  await Promise.all(
    targets.map((target, i) =>
      fetch(target.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': target.mimeType },
        body: files[i].file,
      }),
    ),
  );

  return targets.map((t, i) => ({
    key: t.key,
    mimeType: t.mimeType,
    name: files[i].name,
  }));
};
