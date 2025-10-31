import 'dotenv-defaults/config';
import nodemailer from 'nodemailer';
import ejs from 'ejs';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { DEFAULT_EJS_TEMPLATE, DEFAULT_EMAIL_REQUEST } from './email.consts';
import { logger } from '../logging/logger.service';
import { getEnvironmentVariable } from '../utils';

export class EmailService {
  private transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>;

  constructor(email = undefined, emailPassword = undefined) {
    const user = email || getEnvironmentVariable('MY_EMAIL');
    const pass = emailPassword || getEnvironmentVariable('MY_EMAIL_PASSWORD');
    if (!user || !pass) {
      logger.error('EmailService is not configured properly.');
    }
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass,
      },
    });
  }

  sendEmail(
    request = DEFAULT_EMAIL_REQUEST,
  ): Promise<SMTPTransport.SentMessageInfo> {
    const mailOption = {
      from: request.from,
      to: request.to,
      subject: request.subject,
      text: request.text,
      html: request.html,
    };
    return this.transporter.sendMail(mailOption);
  }

  async sendEjsEmail(
    request = DEFAULT_EMAIL_REQUEST,
    template = DEFAULT_EJS_TEMPLATE,
  ): Promise<SMTPTransport.SentMessageInfo> {
    return ejs.renderFile(template.path, template.data).then(html => {
      return this.sendEmail({
        ...request,
        html,
      });
    });
  }
}
