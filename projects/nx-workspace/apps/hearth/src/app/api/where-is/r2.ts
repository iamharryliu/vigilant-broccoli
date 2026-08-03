import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { R2_PUBLIC_URL } from '../../config';

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

export const readImage = async (key: string): Promise<Buffer> => {
  const response = await getClient().send(
    new GetObjectCommand({ Bucket: BUCKET_NAME, Key: key }),
  );
  if (!response.Body) {
    throw new Error(`Staged image ${key} not found`);
  }
  return Buffer.from(await response.Body.transformToByteArray());
};

export const deleteImage = async (key: string) =>
  getClient().send(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: key }));

export const getImageUrl = (key: string) => `${R2_PUBLIC_URL}/${key}`;
