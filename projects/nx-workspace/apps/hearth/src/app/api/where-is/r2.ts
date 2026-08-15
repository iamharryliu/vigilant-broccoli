import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ImageValidationError } from './image-processor';

const getClient = () =>
  new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY as string,
    },
  });

// Dedicated private bucket (never given a public r2.dev hostname), so these
// presigned URLs are the only way to reach an item's photos.
const BUCKET_NAME = 'where-is';
const PRESIGNED_UPLOAD_EXPIRY_SECONDS = 300;
// Longer than docs' download expiry since these render inline as <img> across
// list/detail views that can stay open a while, not just a single download click.
const PRESIGNED_DOWNLOAD_EXPIRY_SECONDS = 3600;

export const uploadImage = async (
  key: string,
  buffer: Buffer,
  mimeType: string,
) =>
  getClient().send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    }),
  );

export const createImageUploadUrl = (key: string, mimeType: string) =>
  getSignedUrl(
    getClient(),
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: mimeType,
    }),
    { expiresIn: PRESIGNED_UPLOAD_EXPIRY_SECONDS },
  );

export const readImage = async (
  key: string,
  maxBytes: number,
): Promise<Buffer> => {
  const response = await getClient().send(
    new GetObjectCommand({ Bucket: BUCKET_NAME, Key: key }),
  );
  if (!response.Body) {
    throw new Error(`Staged image ${key} not found`);
  }
  // Reject before buffering the body — the staged object may be far larger than maxBytes.
  if ((response.ContentLength ?? 0) > maxBytes) {
    throw new ImageValidationError(
      `Image exceeds maximum size of ${maxBytes / 1024 / 1024}MB.`,
    );
  }
  return Buffer.from(await response.Body.transformToByteArray());
};

export const deleteImage = async (key: string) =>
  getClient().send(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: key }));

export const getImageUrl = (key: string) =>
  getSignedUrl(
    getClient(),
    new GetObjectCommand({ Bucket: BUCKET_NAME, Key: key }),
    { expiresIn: PRESIGNED_DOWNLOAD_EXPIRY_SECONDS },
  );
