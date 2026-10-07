import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
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
      secretAccessKey: getEnvironmentVariable(
        'AWS_SECRET_ACCESS_KEY',
      ) as string,
    },
  });
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
