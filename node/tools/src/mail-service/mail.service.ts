import nodemailer from 'nodemailer';
import { DEFAULT_EJS_TEMPLATE, EmailRequest } from './mail.model';
import ejs from 'ejs';

export class MailService {
  static transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MY_EMAIL,
      pass: process.env.MY_EMAIL_PASSWORD,
    },
  });

  static sendEmail(request: EmailRequest) {
    const mailOption = {
      from: request.from,
      to: request.to,
      subject: request.subject,
      text: !request.html ? request.text : null,
      html: request.html,
    };
    return this.transporter.sendMail(mailOption, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  }

  static sendEjsEmail(request: EmailRequest, template = DEFAULT_EJS_TEMPLATE) {
    return ejs.renderFile(template.path, template.data).then(template => {
      return this.sendEmail({
        ...request,
        html: template,
      });
    });
  }
}
