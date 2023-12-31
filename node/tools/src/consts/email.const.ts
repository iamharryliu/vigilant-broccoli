import path from 'path';
import { EjsTemplate } from '../models/email.model';
import { EmailRequest } from '../models/email.model';

export const DEFAULT_EMAIL_REQUEST: EmailRequest = {
  from: `harryliu.design <${process.env.MY_EMAIL}>`,
  to: process.env.MY_EMAIL,
  subject: 'Default subject',
  text: 'Default message',
};
export const DEFAULT_EJS_TEMPLATE: EjsTemplate = {
  path: path.join(__dirname, 'assets/default.ejs'),
};
