import {
  API_KEY_HEADER,
  CONTENT_TYPE_HEADER,
  HTTP_METHOD,
} from '@vigilant-broccoli/common-js';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';
import { ImageValidationError } from './image-processor';

const BUCKET_API = `${getEnvironmentVariable('VB_EXPRESS_URL')}/api/storage`;
const API_HEADERS = {
  [API_KEY_HEADER]: getEnvironmentVariable('VB_EXPRESS_API_KEY'),
};

const PROVIDER = 'cloudflare-r2';
// Scanned receipts are home paperwork, so they live in the already-provisioned
// private home-docs bucket under a receipts/ prefix rather than needing a new
// bucket + CORS rule in terraform. Like home-docs, it never gets a public
// r2.dev hostname — presigned URLs are the only way in.
const BUCKET_NAME = 'home-docs';
const PRESIGNED_UPLOAD_EXPIRY_SECONDS = 300;
const PRESIGNED_DOWNLOAD_EXPIRY_SECONDS = 3600;

const UPLOAD_URL_PATH = 'upload-url';
const DOWNLOAD_URL_PATH = 'download-url';
const DELETE_PATH = 'file';
const PROVIDER_PARAM = 'provider';
const BUCKET_NAME_PARAM = 'bucketName';
const FILE_NAME_PARAM = 'fileName';
const EXPIRES_IN_SECONDS_PARAM = 'expiresInSeconds';
const CONTENT_TYPE_PARAM = 'contentType';

export const RECEIPT_KEY_PREFIX = 'receipts';
export const STAGING_KEY_PREFIX = 'receipts/staging';

// Carries the upstream status so the route can report which hop rejected the
// request instead of collapsing everything into an opaque 500.
export class BucketError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'BucketError';
  }
}

const presignedUrl = async (
  path: typeof UPLOAD_URL_PATH | typeof DOWNLOAD_URL_PATH,
  fileName: string,
  expiresInSeconds: number,
  contentType?: string,
): Promise<string> => {
  const params = new URLSearchParams({
    [PROVIDER_PARAM]: PROVIDER,
    [BUCKET_NAME_PARAM]: BUCKET_NAME,
    [FILE_NAME_PARAM]: fileName,
    [EXPIRES_IN_SECONDS_PARAM]: String(expiresInSeconds),
  });
  if (contentType) params.set(CONTENT_TYPE_PARAM, contentType);

  const response = await fetch(`${BUCKET_API}/${path}?${params}`, {
    headers: API_HEADERS,
  });
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new BucketError(
      `Bucket service ${path} failed: ${response.status} ${body}`.trim(),
      response.status,
    );
  }
  const { url } = (await response.json()) as { url: string };
  return url;
};

export const uploadImage = async (
  key: string,
  buffer: Buffer,
  mimeType: string,
) => {
  const uploadUrl = await presignedUrl(
    UPLOAD_URL_PATH,
    key,
    PRESIGNED_UPLOAD_EXPIRY_SECONDS,
    mimeType,
  );
  const response = await fetch(uploadUrl, {
    method: HTTP_METHOD.PUT,
    body: new Uint8Array(buffer),
    headers: { [CONTENT_TYPE_HEADER]: mimeType },
  });
  if (!response.ok) {
    throw new Error(`R2 upload failed: ${response.status}`);
  }
};

export const createImageUploadUrl = (key: string, mimeType: string) =>
  presignedUrl(UPLOAD_URL_PATH, key, PRESIGNED_UPLOAD_EXPIRY_SECONDS, mimeType);

export const readImage = async (
  key: string,
  maxBytes: number,
): Promise<Buffer> => {
  const downloadUrl = await presignedUrl(
    DOWNLOAD_URL_PATH,
    key,
    PRESIGNED_DOWNLOAD_EXPIRY_SECONDS,
  );
  const response = await fetch(downloadUrl);
  if (!response.ok) {
    throw new Error(`Staged image ${key} not found`);
  }
  const contentLength = Number(response.headers.get('content-length') ?? 0);
  if (contentLength > maxBytes) {
    throw new ImageValidationError(
      `Image exceeds maximum size of ${maxBytes / 1024 / 1024}MB.`,
    );
  }
  return Buffer.from(await response.arrayBuffer());
};

export const deleteImage = async (key: string) => {
  const params = new URLSearchParams({
    [PROVIDER_PARAM]: PROVIDER,
    [BUCKET_NAME_PARAM]: BUCKET_NAME,
    [FILE_NAME_PARAM]: key,
  });
  const response = await fetch(`${BUCKET_API}/${DELETE_PATH}?${params}`, {
    method: HTTP_METHOD.DELETE,
    headers: API_HEADERS,
  });
  if (!response.ok) {
    throw new Error(`R2 delete failed: ${response.status}`);
  }
};

export const getImageUrl = (key: string) =>
  presignedUrl(DOWNLOAD_URL_PATH, key, PRESIGNED_DOWNLOAD_EXPIRY_SECONDS);
