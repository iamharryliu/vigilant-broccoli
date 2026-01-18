import axios from 'axios';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import 'dotenv/config';

const FILE_URL =
  'https://github.com/iamharryliu/vigilant-broccoli/archive/refs/heads/main.zip';
const FILENAME = 'vigilant-broccoli.zip';

async function downloadRepoAsBuffer(fileUrl: string): Promise<Buffer> {
  const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
  return Buffer.from(response.data);
}

async function uploadToR2(buffer: Buffer, bucket: string, filepath: string) {
  const r2 = new S3Client({
    region: process.env.AWS_REGION,
    endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
    },
  });

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: filepath,
    Body: buffer,
    ContentType: 'application/zip',
  });

  await r2.send(command);
  console.log(`Uploaded to R2: ${filepath}`);
}

async function main() {
  console.log('Downloading repo archive...');
  const buffer = await downloadRepoAsBuffer(FILE_URL);
  console.log('Uploading to R2...');
  await uploadToR2(buffer, 'vigilant-broccoli', FILENAME);
  console.log('Upload complete.');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
