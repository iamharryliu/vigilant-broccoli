import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
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

export const deleteImage = async (key: string) =>
  getClient().send(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: key }));

export const getImageUrl = (key: string) => `${R2_PUBLIC_URL}/${key}`;
