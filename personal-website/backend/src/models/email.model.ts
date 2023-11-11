export interface EmailRequest {
  from: string;
  to: string;
  subject: string;
  text: string;
}

export const DEFAULT_EMAIL_REQUEST: EmailRequest = {
  from: `harryliu.design <${process.env.MY_EMAIL}>`,
  to: process.env.MY_EMAIL,
  subject: '',
  text: '',
};
