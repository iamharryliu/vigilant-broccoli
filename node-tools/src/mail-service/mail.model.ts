/* eslint-disable @typescript-eslint/no-explicit-any */
import path from 'path';

export interface EmailRequest {
  from: string;
  to: string;
  subject: string;
  text: string;
  html?: any;
}

export interface EjsTemplate {
  path: string;
  data?: any;
}

export const DEFAULT_EMAIL_REQUEST: EmailRequest = {
  from: `harryliu.design <${process.env.MY_EMAIL}>`,
  to: process.env.MY_EMAIL,
  subject: 'Default subject',
  text: 'Default message',
};

export const DEFAULT_EJS_TEMPLATE: EjsTemplate = {
  path: path.join(__dirname, 'assets/default.ejs'),
};
