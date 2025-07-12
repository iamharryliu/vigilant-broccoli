import path from 'path';
import { EjsTemplate, Email } from './email.models';
import { getEnvironmentVariable } from '../utils';

export const DEFAULT_EMAIL_REQUEST: Email = {
  from: `Email Service <${getEnvironmentVariable('MY_EMAIL')}>`,
  to: getEnvironmentVariable('MY_EMAIL'),
  subject: 'Default subject',
  text: 'Default message',
};

export const DEFAULT_EJS_TEMPLATE: EjsTemplate = {
  path: path.resolve(__dirname, './assets/default.ejs'),
  data: {
    text: 'default text',
  },
};
