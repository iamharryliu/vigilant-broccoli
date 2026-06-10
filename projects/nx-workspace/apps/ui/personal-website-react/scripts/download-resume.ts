import * as fs from 'fs';
import * as path from 'path';
import { fetchResumePdfBuffer } from '../../../../scripts/resume.ts';

const OUTPUT_PATH = path.resolve(
  'apps/ui/personal-website-react/public/assets/resume.pdf',
);

fetchResumePdfBuffer()
  .then(buffer => {
    fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
    fs.writeFileSync(OUTPUT_PATH, buffer);
    console.log(`Resume PDF downloaded to ${OUTPUT_PATH}`);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
