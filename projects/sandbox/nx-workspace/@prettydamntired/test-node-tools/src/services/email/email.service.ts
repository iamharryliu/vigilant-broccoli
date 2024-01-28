import 'dotenv-defaults/config';
import nodemailer from 'nodemailer';
import { DEFAULT_EJS_TEMPLATE } from '../../consts/email.const';
import { DEFAULT_EMAIL_REQUEST } from '../../consts/email.const';
import ejs from 'ejs';
import { logger } from '../logging/logger.service';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

export class EmailService {
  email: string;
  password: string;
  transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>;

  constructor(email = undefined, emailPassword = undefined) {
    this.email = email || process.env.MY_EMAIL;
    this.password = emailPassword || process.env.MY_EMAIL_PASSWORD;
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MY_EMAIL,
        pass: process.env.MY_EMAIL_PASSWORD,
      },
    });
  }

  sendEmail(request = DEFAULT_EMAIL_REQUEST) {
    const mailOption = {
      from: request.from,
      to: request.to,
      subject: request.subject,
      text: request.text,
      html: request.html,
    };
    return this.transporter.sendMail(mailOption, (error, info) => {
      if (error) {
        logger.error(error);
      } else {
        logger.info('Email sent: ' + info.response);
      }
    });
  }

  sendEjsEmail(
    request = DEFAULT_EMAIL_REQUEST,
    template = DEFAULT_EJS_TEMPLATE,
  ) {
    return (ejs.renderFile(template.path, template.data) as any).then(
      template => {
        return this.sendEmail({
          ...request,
          html: template,
        });
      },
    );
  }
}
