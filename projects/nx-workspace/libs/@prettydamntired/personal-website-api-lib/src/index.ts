import { APP_NAME } from '@prettydamntired/personal-website-lib';
import { EmailRequest } from '@prettydamntired/test-node-tools';
export * from './database/database.const';
export * from './database/database.model';
export * from './services/database-manager.service';

export const DEFAULT_APP_EMAIL_CONFIG = {
  [APP_NAME.HARRYLIU_DESIGN]: {
    from: `'harryliu.design' <${process.env.MY_EMAIL}>`,
    to: `'harryliu.design' <${process.env.MY_EMAIL}>`,
    subject: 'harryliu.design default subject',
    text: 'harryliu.design default text',
  } as EmailRequest,
};
