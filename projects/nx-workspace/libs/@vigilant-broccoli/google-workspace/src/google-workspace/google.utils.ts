import path from 'path';
import { SIGNATURE_TMP_DIR } from './google.consts';

export const getEmailSignatureFilepath = (email: string): string => {
  return path.resolve(SIGNATURE_TMP_DIR, `${email}.html`);
};
