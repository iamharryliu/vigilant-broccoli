import 'dotenv-defaults/config';
import nodemailer from 'nodemailer';
import { DEFAULT_EJS_TEMPLATE } from '../../consts/email.const';
import { DEFAULT_EMAIL_REQUEST } from '../../consts/email.const';
import ejs from 'ejs';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

export class EmailService {
  private transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>;

  constructor(email = undefined, emailPassword = undefined) {
    const user = email || process.env.MY_EMAIL;
    const pass = emailPassword || process.env.MY_EMAIL_PASSWORD;
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
    return (ejs.renderFile(template.path, template.data) as any).then(html => {
      return this.sendEmail({
        ...request,
        html,
      });
    });
  }
}
