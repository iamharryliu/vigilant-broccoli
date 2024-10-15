// Consts
export * from './consts/email.const';
// Models
export * from './models/email.model';
// Services
export { logger } from './services/logging/logger.service';
export { Logger } from './services/logging/logger';
export { EmailService } from './services/email/email.service';
export { EncryptionService } from './services/encryption/encryption.service';
export { RecaptchaService } from './services/recaptcha/recaptcha.service';
export { SiteMonitor } from './services/site-monitor/site-monitor.service';
export { TextMessageService } from './services/text-message/text-message.service';

import fs from 'fs';

export interface HashmapCache<T> {
  [key: string]: T;
}

const getFromFilepath = <T>(filepath: string, structure: T): T => {
  try {
    const cache = JSON.parse(fs.readFileSync(filepath, { encoding: 'utf-8' }));
    return cache as T;
  } catch {
    console.debug(`Filepath '${filepath}'not found.`);
    return structure;
  }
};

export const getListFromFilepath = <T>(filepath: string): T[] => {
  return getFromFilepath(filepath, [] as T[]);
};

export const getHashmapFromFilepath = <T>(
  filepath: string,
): HashmapCache<T> => {
  return getFromFilepath(filepath, {} as HashmapCache<T>);
};
