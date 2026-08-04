import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { R2_PUBLIC_URL } from '../../config';
import { FileValidationError } from './file-processor';

const getClient = () =>
  new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY as string,
    },
  });

const BUCKET_NAME = 'home-management';
const PRESIGNED_UPLOAD_EXPIRY_SECONDS = 300;

export const uploadFile = (key: string, buffer: Buffer, mimeType: string) =>
  getClient().send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    }),
  );

export const createFileUploadUrl = (key: string, mimeType: string) =>
  getSignedUrl(
    getClient(),
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: mimeType,
    }),
    { expiresIn: PRESIGNED_UPLOAD_EXPIRY_SECONDS },
  );

export const readFile = async (
  key: string,
  maxBytes: number,
): Promise<Buffer> => {
  const response = await getClient().send(
    new GetObjectCommand({ Bucket: BUCKET_NAME, Key: key }),
  );
  if (!response.Body) {
    throw new Error(`Staged file ${key} not found`);
  }
  // Reject before buffering the body — the staged object may be far larger than maxBytes.
  if ((response.ContentLength ?? 0) > maxBytes) {
    throw new FileValidationError(
      `File exceeds maximum size of ${maxBytes / 1024 / 1024}MB.`,
    );
  }
  return Buffer.from(await response.Body.transformToByteArray());
};

export const deleteFile = (key: string) =>
  getClient().send(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: key }));

export const getFileUrl = (key: string) => `${R2_PUBLIC_URL}/${key}`;
