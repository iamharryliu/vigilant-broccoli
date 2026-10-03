import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { Resend } from 'resend';
import { DEFAULT_TEMPLATE_DATA, getDefaultEmailRequest } from './email.consts';
import { logger, getEnvironmentVariable } from '@vigilant-broccoli/common-node';
import { Email } from './email.models';
import { renderDefaultEmailTemplate } from './email.utils';

type EmailProvider = 'smtp' | 'resend';

const DEFAULT_FROM = 'test@harryliu.dev';

interface SmtpConfig {
  provider: 'smtp';
  email?: string;
  emailPassword?: string;
}

interface ResendConfig {
  provider: 'resend';
  apiKey?: string;
}

export type EmailServiceConfig = SmtpConfig | ResendConfig;

export class EmailService {
  private provider: EmailProvider;
  private defaultFrom: string;
  private transporter?: nodemailer.Transporter<SMTPTransport.SentMessageInfo>;
  private resend?: Resend;

  constructor(
    config: EmailServiceConfig = { provider: 'smtp' },
    defaultFrom = DEFAULT_FROM,
  ) {
    this.provider = config.provider;
    this.defaultFrom = defaultFrom;

    if (config.provider === 'resend') {
      const apiKey = config.apiKey || getEnvironmentVariable('RESEND_API_KEY');
      if (!apiKey) {
        logger.error('EmailService (resend) is not configured properly.');
      }
      this.resend = new Resend(apiKey);
    } else {
      const user = config.email || getEnvironmentVariable('MY_EMAIL');
      const pass =
        config.emailPassword || getEnvironmentVariable('MY_EMAIL_PASSWORD');
      if (!user || !pass) {
        logger.error('EmailService (smtp) is not configured properly.');
      }
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
      });
    }
  }

  async sendEmail(request: Email = getDefaultEmailRequest()): Promise<void> {
    const from = request.from || this.defaultFrom;

    if (this.provider === 'resend' && this.resend) {
      const to = Array.isArray(request.to) ? request.to : [request.to];
      const content = request.html
        ? { html: request.html }
        : { text: request.text || request.subject };
      const { error } = await this.resend.emails.send({
        from,
        to,
        subject: request.subject,
        ...content,
      });
      if (error) {
        throw new Error(error.message);
      }
      return;
    }

    if (this.transporter) {
      await this.transporter.sendMail({
        from,
        to: request.to,
        subject: request.subject,
        text: request.text,
        html: request.html,
      });
    }
  }

  async sendDefaultTemplateEmail(
    request: Email = getDefaultEmailRequest(),
    data = DEFAULT_TEMPLATE_DATA,
  ): Promise<void> {
    const html = renderDefaultEmailTemplate(data);
    return this.sendEmail({ ...request, html });
  }
}
