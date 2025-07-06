import os from 'os';
import fs from 'fs';
import { google } from 'googleapis';
import path from 'path';

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });
  const authClient = await auth.getClient();

  const resumeDriveFileId = '1s6Wy8i4zU85o19qyXKhdpH4jdTP36QDPUgZdV7E6-QU';
  const outputPath = path.join(
    os.homedir(),
    'vigilant-broccoli/projects/nx-workspace/apps/ui/personal-website-frontend/src/assets/resume.pdf',
  );

  downloadDocAsPdf(authClient, resumeDriveFileId, outputPath);
}

function downloadDocAsPdf(authClient: any, fileId: string, outputPath: string) {
  const drive = google.drive({ version: 'v3', auth: authClient });
  drive.files.export(
    {
      fileId,
      mimeType: 'application/pdf',
    },
    { responseType: 'stream' },
    (err, res) => {
      if (err) return console.error('API error:', err);
      const dest = fs.createWriteStream(outputPath);
      res!.data
        .on('end', () => {
          console.log('PDF downloaded to', outputPath);
        })
        .on('error', (err: any) => {
          console.error('Download error:', err);
        })
        .pipe(dest);
    },
  );
}

main();
