import path from 'path';
import { EjsTemplate, Email } from './email.models';

export const DEFAULT_EMAIL_REQUEST: Email = {
  from: `Email Service <${process.env.MY_EMAIL}>`,
  to: process.env.MY_EMAIL,
  subject: 'Default subject',
  text: 'Default message',
};

export const DEFAULT_EJS_TEMPLATE: EjsTemplate = {
  path: path.resolve(__dirname, '../services/assets/default.ejs'),
  data: {
    text: 'default text',
  },
};
