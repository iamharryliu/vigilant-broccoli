import { TMP_PATH } from '@vigilant-broccoli/common-node';
import path from 'path';

export const EMAIL_BACKUP_DIRECTORY = path.resolve(
  TMP_PATH,
  'google-email-backup',
);
export const SIGNATURE_TMP_DIR = path.resolve(TMP_PATH, 'email-signatures');
