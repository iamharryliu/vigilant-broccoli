import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const SRC_DIR = 'apps/ui/pages-index/src';
const DICTIONARY_FILE = join(SRC_DIR, 'app/i18n/en.json');
const SOURCE_FILE_PATTERN = /\.tsx?$/;
const TRANSLATION_KEY_PATTERN =
  /\bt\(\s*(['"])([A-Z0-9_]+(?:\.[A-Z0-9_]+)+)\1/g;
const KEY_SEPARATOR = '.';

type Dictionary = { [key: string]: string | Dictionary };

const listSourceFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return listSourceFiles(path);
    return SOURCE_FILE_PATTERN.test(entry.name) ? [path] : [];
  });

const hasKey = (dictionary: Dictionary, key: string) =>
  typeof key
    .split(KEY_SEPARATOR)
    .reduce<string | Dictionary | undefined>(
      (node, part) => (typeof node === 'object' ? node[part] : undefined),
      dictionary,
    ) === 'string';

const dictionary: Dictionary = JSON.parse(
  readFileSync(DICTIONARY_FILE, 'utf8'),
);

const missing = listSourceFiles(SRC_DIR).flatMap(file =>
  [...readFileSync(file, 'utf8').matchAll(TRANSLATION_KEY_PATTERN)]
    .map(match => match[2])
    .filter(key => !hasKey(dictionary, key))
    .map(key => `${file}: ${key}`),
);

if (missing.length) {
  console.error(`Translation keys missing from ${DICTIONARY_FILE}:`);
  missing.forEach(entry => console.error(`  ${entry}`));
  process.exit(1);
}
