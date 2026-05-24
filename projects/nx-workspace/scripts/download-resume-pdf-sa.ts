import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { fetchResumePdfBufferWithAuth } from './resume.ts';

const R2_BUCKET = 'vigilant-broccoli';
const R2_FILEPATH = 'HarryLiu-Resume.pdf';

async function main() {
  const buffer = await fetchResumePdfBufferWithAuth();
  const r2 = new S3Client({
    region: process.env.AWS_REGION,
    endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
    },
  });
  await r2.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: R2_FILEPATH,
      Body: buffer,
      ContentType: 'application/pdf',
    }),
  );
  console.log(`Uploaded to R2: ${R2_FILEPATH}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
