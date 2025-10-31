import { APP_NAME } from '@prettydamntired/personal-website-lib';
import { Email, getEnvironmentVariable } from '@vigilant-broccoli/common-node';

export * from './database/database.const';
export * from './database/database.model';
export * from './services/database-manager.service';

const DEFAULT_EMAIL_MESSAGE = {
  from: `'[default_from]' <${getEnvironmentVariable('MY_EMAIL')}>`,
  to: `'[default_to]' <${getEnvironmentVariable('MY_EMAIL')}>`,
  subject: '[default_subject]',
  text: '[default_text]',
};

export const DEFAULT_APP_EMAIL_CONFIG = {
  [APP_NAME.HARRYLIU_DESIGN]: {
    ...DEFAULT_EMAIL_MESSAGE,
    from: `'harryliu.dev' <${getEnvironmentVariable('MY_EMAIL')}>`,
    to: `'harryliu.dev' <${getEnvironmentVariable('MY_EMAIL')}>`,
  } as Email,
  [APP_NAME.CLOUD_8_SKATE]: {
    ...DEFAULT_EMAIL_MESSAGE,
    from: `'cloud8skate' <${getEnvironmentVariable('MY_EMAIL')}>`,
    to: `'cloud8skate' cloud8.ca@gmail.com`,
  } as Email,
};
