import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

// One-off: gives where-is photos saved before list thumbnails existed a
// thumbnail, so the list stops falling back to the full-size image.
// Only adds objects and fills a null column; pass --dry-run to list the work.
// Run with Hearth's env (see the `serve` target's fetch-secrets wrapper).

// Same committed public default next.config.js falls back to; read from disk
// because module boundaries forbid importing the lib by relative path.
const SUPABASE_PUBLIC_JSON = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../libs/@vigilant-broccoli/infrastructure/src/lib/supabase-public.json',
);
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  (JSON.parse(readFileSync(SUPABASE_PUBLIC_JSON, 'utf8')) as { url: string })
    .url;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
const VB_EXPRESS_URL = process.env.VB_EXPRESS_URL;
const VB_EXPRESS_API_KEY = process.env.VB_EXPRESS_API_KEY;
const MEDIA_SERVICE_URL = process.env.MEDIA_SERVICE_URL;
const SHARED_APP_TOKEN = process.env.SHARED_APP_TOKEN;

if (
  !SUPABASE_URL ||
  !SUPABASE_SECRET_KEY ||
  !VB_EXPRESS_URL ||
  !VB_EXPRESS_API_KEY ||
  !MEDIA_SERVICE_URL ||
  !SHARED_APP_TOKEN
) {
  console.error(
    'Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY, VB_EXPRESS_URL, VB_EXPRESS_API_KEY, MEDIA_SERVICE_URL, SHARED_APP_TOKEN',
  );
  process.exit(1);
}

const DRY_RUN = process.argv.includes('--dry-run');
const CONCURRENCY = 3;
const API_KEY_HEADER = 'x-api-key';
const JPEG_MIME_TYPE = 'image/jpeg';
const BUCKET_PARAMS = { provider: 'cloudflare-r2', bucketName: 'where-is' };
const URL_EXPIRY_SECONDS = 300;
const THUMBNAIL_ENDPOINT = 'api/where-is/thumbnail';

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Must match toThumbnailKey in src/app/api/where-is/r2.ts.
const toThumbnailKey = (key: string) => key.replace(/\.jpg$/, '.thumb.jpg');

const assertOk = async (res: Response, label: string) => {
  if (!res.ok) throw new Error(`${label} ${res.status}: ${await res.text()}`);
};

const presign = async (
  path: 'download-url' | 'upload-url',
  fileName: string,
  contentType?: string,
) => {
  const params = new URLSearchParams({
    ...BUCKET_PARAMS,
    fileName,
    expiresInSeconds: String(URL_EXPIRY_SECONDS),
    ...(contentType && { contentType }),
  });
  const res = await fetch(`${VB_EXPRESS_URL}/api/storage/${path}?${params}`, {
    headers: { [API_KEY_HEADER]: VB_EXPRESS_API_KEY },
  });
  await assertOk(res, path);
  return ((await res.json()) as { url: string }).url;
};

const createThumbnail = async (image: Buffer) => {
  const body = new FormData();
  body.append(
    'file',
    new Blob([new Uint8Array(image)], { type: JPEG_MIME_TYPE }),
  );
  const res = await fetch(`${MEDIA_SERVICE_URL}/${THUMBNAIL_ENDPOINT}`, {
    method: 'POST',
    headers: { [API_KEY_HEADER]: SHARED_APP_TOKEN },
    body,
  });
  await assertOk(res, 'thumbnail');
  return Buffer.from(await res.arrayBuffer());
};

const backfill = async (row: { id: string; r2_key: string }) => {
  const thumbnailKey = toThumbnailKey(row.r2_key);
  const original = await fetch(await presign('download-url', row.r2_key));
  await assertOk(original, `read ${row.r2_key}`);
  const thumbnail = await createThumbnail(
    Buffer.from(await original.arrayBuffer()),
  );

  const upload = await fetch(
    await presign('upload-url', thumbnailKey, JPEG_MIME_TYPE),
    {
      method: 'PUT',
      body: new Uint8Array(thumbnail),
      headers: { 'Content-Type': JPEG_MIME_TYPE },
    },
  );
  await assertOk(upload, `upload ${thumbnailKey}`);

  // The null guard leaves a row alone if a save gave it a thumbnail meanwhile.
  const { error } = await supabase
    .from('where_is_images')
    .update({ thumbnail_r2_key: thumbnailKey })
    .eq('id', row.id)
    .is('thumbnail_r2_key', null);
  if (error) throw new Error(error.message);
  return thumbnail.byteLength;
};

const main = async () => {
  const { data, error } = await supabase
    .from('where_is_images')
    .select('id, r2_key')
    .is('thumbnail_r2_key', null);
  if (error) throw new Error(error.message);

  const rows = (data ?? []).filter(row => row.r2_key.endsWith('.jpg'));
  const skipped = (data ?? []).length - rows.length;
  console.log(
    `${rows.length} image(s) need a thumbnail${skipped ? `, ${skipped} skipped (not .jpg)` : ''}`,
  );
  if (DRY_RUN || !rows.length) return;

  let done = 0;
  let failed = 0;
  let thumbnailBytes = 0;
  for (let i = 0; i < rows.length; i += CONCURRENCY) {
    const results = await Promise.allSettled(
      rows.slice(i, i + CONCURRENCY).map(backfill),
    );
    results.forEach((result, j) => {
      const row = rows[i + j];
      if (result.status === 'fulfilled') {
        done++;
        thumbnailBytes += result.value;
      } else {
        failed++;
        console.error(`✗ ${row.r2_key}: ${result.reason}`);
      }
    });
    console.log(`${done + failed}/${rows.length}`);
  }
  console.log(
    `Done: ${done} thumbnail(s), ${failed} failed, average ${done ? Math.round(thumbnailBytes / done / 1024) : 0} kB`,
  );
  if (failed) process.exitCode = 1;
};

main().catch(e => {
  console.error(e);
  process.exit(1);
});
