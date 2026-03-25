import * as fs from 'fs';
import * as path from 'path';

const GOOGLE_DOC_ID = '1s6Wy8i4zU85o19qyXKhdpH4jdTP36QDPUgZdV7E6-QU';
const EXPORT_URL = `https://docs.google.com/document/d/${GOOGLE_DOC_ID}/export?format=pdf`;
const OUTPUT_PATH = path.resolve(
  'apps/ui/personal-website-frontend/src/assets/resume.pdf',
);

const downloadResumePdf = async () => {
  const response = await fetch(EXPORT_URL, { redirect: 'follow' });
  if (!response.ok) {
    throw new Error(`Failed to download: ${response.status}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(OUTPUT_PATH, buffer);
  console.log(`Resume PDF downloaded to ${OUTPUT_PATH}`);
};

downloadResumePdf().catch(err => {
  console.error('Error downloading resume PDF:', err);
  process.exit(1);
});
