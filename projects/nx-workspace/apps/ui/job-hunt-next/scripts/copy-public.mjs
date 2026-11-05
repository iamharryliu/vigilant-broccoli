import { cp, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const APP_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT_DIR = resolve(
  APP_DIR,
  '../../../dist/apps/ui/job-hunt-next/public',
);

// Vercel's Nx output lives outside the app, so its collector looks for public
// next to the configured .next output instead of in the app's source folder.
await rm(OUTPUT_DIR, { recursive: true, force: true });
await cp(resolve(APP_DIR, 'public'), OUTPUT_DIR, { recursive: true });
