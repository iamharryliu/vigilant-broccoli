import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { DEFAULT_BOOKMARKS } from './default-bookmarks';

const OUTPUT = join(
  process.cwd(),
  'apps/ui/bookmarks-react/public/default-bookmarks.json',
);

mkdirSync(dirname(OUTPUT), { recursive: true });
writeFileSync(OUTPUT, `${JSON.stringify(DEFAULT_BOOKMARKS, null, 2)}\n`);
