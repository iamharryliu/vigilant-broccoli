/* eslint-disable @typescript-eslint/no-explicit-any */

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
