import 'dotenv/config';
import { google } from 'googleapis';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
// import https from 'https';
// import { NodeHttpHandler } from "@smithy/node-http-handler";

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });
  const authClient = await auth.getClient();
  const resumeDriveFileId = '1s6Wy8i4zU85o19qyXKhdpH4jdTP36QDPUgZdV7E6-QU';
  const buffer = await downloadDocAsPdf(authClient, resumeDriveFileId);
  await uploadToR2(buffer, 'vigilant-broccoli', 'HarryLiu-Resume.pdf');
}

async function downloadDocAsPdf(auth: any, fileId: string): Promise<Buffer> {
  const drive = google.drive({ version: 'v3', auth });
  return new Promise((resolve, reject) => {
    drive.files.export(
      {
        fileId,
        mimeType: 'application/pdf',
      },
      { responseType: 'stream' },
      (err, res) => {
        if (err) return reject(err);
        const chunks: Buffer[] = [];
        res!.data
          .on('data', chunk => chunks.push(chunk))
          .on('end', () => {
            console.log('PDF downloaded as buffer');
            resolve(Buffer.concat(chunks));
          })
          .on('error', err => reject(err));
      },
    );
  });
}

async function uploadToR2(buffer: Buffer, bucket: string, filepath: string) {
  // const agent = new https.Agent({
  //   minVersion: 'TLSv1.2',
  //   maxVersion: 'TLSv1.3',
  // });
  const r2 = new S3Client({
    region: process.env.AWS_REGION,
    endpoint: `https://${process.env.CLOUDFLARE_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.CLOUDFLARE_R2_ACCESS_KEY!,
    },
    // requestHandler: new NodeHttpHandler({ httpsAgent: agent }),
  });

  try {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: filepath,
      Body: buffer,
      ContentType: 'application/pdf',
    });

    await r2.send(command);
    console.log(`Uploaded to R2: ${filepath}`);
  } catch (err) {
    console.error('R2 upload error:', err);
  }
}

main();
