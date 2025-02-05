import { QA_FOLDER, CACHE_FOLDER } from '@vigilant-broccoli/common-node';
import path from 'path';

export const GENERATED_SIGNATURES_DIRECTORY = path.resolve(
  QA_FOLDER,
  'signatures',
);

export const ALL_GENERATED_SIGNATURES_FILENAME = 'all-users.html';
export const ALL_GENERATED_SIGNATURES_FILEPATH = path.resolve(
  QA_FOLDER,
  ALL_GENERATED_SIGNATURES_FILENAME,
);
export const ZIPPED_GENERATED_SIGNATURES_FILEPATH = `${GENERATED_SIGNATURES_DIRECTORY}.zip`;
export const ZIPPED_GENERATED_SIGNATURES_FILENAME = path.basename(
  ZIPPED_GENERATED_SIGNATURES_FILEPATH,
);
export const SIGNATURE_CACHE_FILEPATH = path.resolve(
  CACHE_FOLDER,
  'SIGNATURE_CACHE.json',
);
