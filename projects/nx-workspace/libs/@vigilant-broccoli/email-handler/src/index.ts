import { APP_NAME } from '@prettydamntired/personal-website-lib';
import { EmailRequest } from '@prettydamntired/test-node-tools';

const DEFAULT_EMAIL_MESSAGE = {
  from: `'[default_from]' <${process.env.MY_EMAIL}>`,
  to: `'[default_to]' <${process.env.MY_EMAIL}>`,
  subject: '[default_subject]',
  text: '[default_text]',
};

export const DEFAULT_APP_EMAIL_CONFIG = {
  [APP_NAME.HARRYLIU_DESIGN]: {
    ...DEFAULT_EMAIL_MESSAGE,
    from: `'harryliu.design' <${process.env.MY_EMAIL}>`,
    to: `'harryliu.design' <${process.env.MY_EMAIL}>`,
  } as EmailRequest,
  [APP_NAME.CLOUD_8_SKATE]: {
    ...DEFAULT_EMAIL_MESSAGE,
    from: `'cloud8skate' <${process.env.MY_EMAIL}>`,
    to: `'cloud8skate' <${process.env.MY_EMAIL}>`,
  } as EmailRequest,
};