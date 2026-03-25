import * as fs from 'fs';
import * as https from 'https';
import * as path from 'path';

const GOOGLE_DOC_ID = '1s6Wy8i4zU85o19qyXKhdpH4jdTP36QDPUgZdV7E6-QU';
const EXPORT_URL = `https://docs.google.com/document/d/${GOOGLE_DOC_ID}/export?format=pdf`;
const OUTPUT_PATH = path.resolve(
  'apps/ui/personal-website-frontend/src/assets/resume.pdf',
);

const download = (url: string, dest: string): Promise<void> =>
  new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, response => {
        if (
          response.statusCode &&
          response.statusCode >= 300 &&
          response.statusCode < 400 &&
          response.headers.location
        ) {
          file.close();
          fs.unlinkSync(dest);
          download(response.headers.location, dest).then(resolve).catch(reject);
          return;
        }

        if (response.statusCode !== 200) {
          file.close();
          fs.unlinkSync(dest);
          reject(new Error(`Failed to download: ${response.statusCode}`));
          return;
        }

        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`Resume PDF downloaded to ${dest}`);
          resolve();
        });
      })
      .on('error', err => {
        fs.unlinkSync(dest);
        reject(err);
      });
  });

download(EXPORT_URL, OUTPUT_PATH).catch(err => {
  console.error('Error downloading resume PDF:', err);
  process.exit(1);
});
