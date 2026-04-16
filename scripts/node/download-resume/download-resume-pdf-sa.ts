import 'dotenv/config';
import { google } from 'googleapis';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const RESUME_DRIVE_FILE_ID = '1s6Wy8i4zU85o19qyXKhdpH4jdTP36QDPUgZdV7E6-QU';
const R2_BUCKET = 'vigilant-broccoli';
const R2_FILEPATH = 'HarryLiu-Resume.pdf';

async function main() {
  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });
  const authClient = await auth.getClient();
  const buffer = await downloadDocAsPdf(authClient, RESUME_DRIVE_FILE_ID);
  await uploadToR2(buffer, R2_BUCKET, R2_FILEPATH);
}

async function downloadDocAsPdf(auth: any, fileId: string): Promise<Buffer> {
  const drive = google.drive({ version: 'v3', auth });
  return new Promise((resolve, reject) => {
    drive.files.export(
      { fileId, mimeType: 'application/pdf' },
      { responseType: 'stream' },
      (err, res) => {
        if (err) return reject(err);
        const chunks: Buffer[] = [];
        res!.data
          .on('data', chunk => chunks.push(chunk))
          .on('end', () => resolve(Buffer.concat(chunks)))
          .on('error', err => reject(err));
      },
    );
  });
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
    ContentType: 'application/pdf',
  });
  await r2.send(command);
  console.log(`Uploaded to R2: ${filepath}`);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
