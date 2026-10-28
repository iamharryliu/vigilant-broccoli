import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { resumeData } from '@vigilant-broccoli/resume';
import {
  CoverLetterPdfOverflowError,
  generateCoverLetterPdfBuffer,
} from '@vigilant-broccoli/resume/server';

const [inputPath, outputPath, titleOverride] = process.argv.slice(2);

if (!inputPath || !outputPath) {
  console.error(
    'Usage: generate-cover-letter-pdf.ts <letter.txt> <output.pdf> [header title]',
  );
  process.exit(1);
}

generateCoverLetterPdfBuffer(
  resumeData,
  readFileSync(inputPath, 'utf-8'),
  titleOverride,
)
  .then(pdf => {
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, pdf);
    console.log(`Cover letter PDF written to ${outputPath}`);
  })
  .catch(error => {
    console.error(
      error instanceof CoverLetterPdfOverflowError ? error.message : error,
    );
    process.exit(1);
  });
