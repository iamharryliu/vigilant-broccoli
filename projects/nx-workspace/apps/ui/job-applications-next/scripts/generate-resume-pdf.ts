import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { generateResumePdfBuffer } from '@vigilant-broccoli/resume/server';
import { readResume } from './skill-resume';

const outputPath = process.argv[2];

if (!outputPath) {
  console.error('Usage: generate-resume-pdf.cjs <output.pdf>');
  process.exit(1);
}

generateResumePdfBuffer(readResume())
  .then(buffer => {
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, buffer);
    console.log(`Resume PDF written to ${outputPath}`);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
