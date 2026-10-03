import nodemailer, { Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { Email, EmailTemplateData } from './email.models';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';

const escapeHtml = (text: string): string =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export const renderDefaultEmailTemplate = ({
  text,
}: EmailTemplateData): string =>
  `<h1>Default Email Template</h1>\n<pre>${escapeHtml(text)}</pre>`;

const getGmailTransportOptions = (
  user: string,
  pass: string,
): { service: string; auth: { user: string; pass: string } } => {
  return {
    service: 'gmail',
    auth: {
      user,
      pass,
    },
  };
};

export const createGmailTransport = (
  user: string,
  pass: string,
): Transporter<SMTPTransport.SentMessageInfo, SMTPTransport.Options> => {
  return nodemailer.createTransport(getGmailTransportOptions(user, pass));
};

export const sendEmail = async (email: Email): Promise<void> => {
  const transporter = createGmailTransport(
    getEnvironmentVariable('EMAIL_SENDER') as string,
    getEnvironmentVariable('EMAIL_SENDER_PASSWORD') as string,
  );
  await transporter.sendMail(email);
};
