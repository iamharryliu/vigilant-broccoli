import { google } from 'googleapis';

const RESUME_DRIVE_FILE_ID = '1s6Wy8i4zU85o19qyXKhdpH4jdTP36QDPUgZdV7E6-QU';
const RESUME_EXPORT_URL = `https://docs.google.com/document/d/${RESUME_DRIVE_FILE_ID}/export?format=pdf`;

export async function fetchResumePdfBuffer(): Promise<Buffer> {
  const response = await fetch(RESUME_EXPORT_URL, { redirect: 'follow' });
  if (!response.ok) {
    throw new Error(`Failed to download: ${response.status}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

export async function fetchResumePdfBufferWithAuth(): Promise<Buffer> {
  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });
  const authClient = await auth.getClient();
  const drive = google.drive({ version: 'v3', auth: authClient });
  return new Promise((resolve, reject) => {
    drive.files.export(
      { fileId: RESUME_DRIVE_FILE_ID, mimeType: 'application/pdf' },
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
