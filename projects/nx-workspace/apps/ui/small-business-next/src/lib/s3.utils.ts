import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  GetObjectCommand,
  DeleteObjectsCommand,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';

function ensureTrailingSlash(path: string | undefined): string {
  if (!path) return '';
  return path.endsWith('/') ? path : path + '/';
}

function getS3Client() {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${getEnvironmentVariable('CLOUDFLARE_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: getEnvironmentVariable('AWS_ACCESS_KEY_ID') as string,
      secretAccessKey: getEnvironmentVariable('AWS_SECRET_ACCESS_KEY') as string,
    },
  });
}

export async function uploadS3File(
  file: Buffer | Uint8Array | Blob | string | Readable,
  filepath: string,
  appName: string,
) {
  const s3 = getS3Client();
  await s3.send(
    new PutObjectCommand({
      Bucket: appName,
      Key: filepath,
      Body: file,
    }),
  );
}

export async function getSubdirectories(
  appName: string,
  prefix?: string,
): Promise<string[]> {
  const s3 = getS3Client();
  const res = await s3.send(
    new ListObjectsV2Command({
      Bucket: appName,
      Prefix: ensureTrailingSlash(prefix),
      Delimiter: '/',
    }),
  );
  return res.CommonPrefixes?.map(d => d.Prefix as string) ?? [];
}

export async function getSubdirectoriesAndFirstImage(
  appName: string,
  prefix?: string,
) {
  const s3 = getS3Client();
  const subdirs = await getSubdirectories(appName, prefix);
  const albums: { albumName: string; firstImageUrl: string }[] = [];

  for (const subdir of subdirs) {
    const res = await s3.send(
      new ListObjectsV2Command({
        Bucket: appName,
        Prefix: subdir,
      }),
    );
    const images = res.Contents;
    if (!images || images.length === 0) continue;

    const firstImageKey = images[0].Key as string;
    albums.push({
      albumName: subdir.replace(/\/$/, '').split('/').pop() as string,
      firstImageUrl: `https://bucket.cloud8skate.com/${firstImageKey}`,
    });
  }
  return albums;
}

export async function getFilenames(
  appName: string,
  prefix?: string,
): Promise<string[]> {
  const s3 = getS3Client();
  const res = await s3.send(
    new ListObjectsV2Command({
      Bucket: appName,
      Prefix: ensureTrailingSlash(prefix),
      Delimiter: '/',
    }),
  );
  return res.Contents?.map(img => img.Key as string) ?? [];
}

export async function getS3File(
  filepath: string,
  appName: string,
): Promise<Buffer> {
  const s3 = getS3Client();
  const res = await s3.send(
    new GetObjectCommand({
      Bucket: appName,
      Key: filepath,
    }),
  );
  if (!res.Body) {
    throw new Error('Missing Body');
  }
  return Buffer.from(await res.Body.transformToByteArray());
}

export async function deleteDirectory(prefix: string, appName: string) {
  const s3 = getS3Client();
  const res = await s3.send(
    new ListObjectsV2Command({
      Bucket: appName,
      Prefix: ensureTrailingSlash(prefix),
    }),
  );
  if (!res.Contents || res.Contents.length === 0) return;

  const objectsToDelete = res.Contents.map(obj => ({ Key: obj.Key as string }));
  await s3.send(
    new DeleteObjectsCommand({
      Bucket: appName,
      Delete: { Objects: objectsToDelete },
    }),
  );
}
