import * as fs from 'fs';
import * as path from 'path';
import type { ResumeData } from '@vigilant-broccoli/resume';
import { generateResumePdfBuffer } from '@vigilant-broccoli/resume/server';

const OUTPUT_PATH = path.resolve(
  'apps/ui/personal-website-react/public/assets/resume.pdf',
);
const RESUME_PATH = path.resolve('../../notes/personal/career/resume.json');

const resume: ResumeData = JSON.parse(fs.readFileSync(RESUME_PATH, 'utf-8'));

generateResumePdfBuffer(resume)
  .then(buffer => {
    fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
    fs.writeFileSync(OUTPUT_PATH, buffer);
    console.log(`Resume PDF generated to ${OUTPUT_PATH}`);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
