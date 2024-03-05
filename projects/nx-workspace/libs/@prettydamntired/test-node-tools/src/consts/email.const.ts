import path from 'path';
import { EjsTemplate } from '../models/email.model';
import { EmailRequest } from '../models/email.model';

export const DEFAULT_EMAIL_REQUEST: EmailRequest = {
  from: `Email Service <${process.env.MY_EMAIL}>`,
  to: process.env.MY_EMAIL,
  subject: 'Default subject',
  text: 'Default message',
};

export const DEFAULT_EJS_TEMPLATE: EjsTemplate = {
  // TODO: find a better way to do this?
  path: path.join(__dirname, '../services/assets/default.ejs'),
  data: {
    text: 'default text',
  },
};
