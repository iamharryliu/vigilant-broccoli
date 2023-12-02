import nodemailer from 'nodemailer';
import { DEFAULT_EJS_TEMPLATE } from '../consts/email.const';
import { DEFAULT_EMAIL_REQUEST } from '../consts/email.const';
import ejs from 'ejs';
import { logger } from '..';

export class EmailService {
  static transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MY_EMAIL,
      pass: process.env.MY_EMAIL_PASSWORD,
    },
  });

  static sendEmail(request = DEFAULT_EMAIL_REQUEST) {
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

  static sendEjsEmail(
    request = DEFAULT_EMAIL_REQUEST,
    template = DEFAULT_EJS_TEMPLATE,
  ) {
    return ejs.renderFile(template.path, template.data).then(template => {
      return this.sendEmail({
        ...request,
        html: template,
      });
    });
  }
}
