import nodemailer from 'nodemailer';
import { EmailRequest } from '../models/email.model';

export class MailTransportService {
  static transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MY_EMAIL,
      pass: process.env.MY_EMAIL_PASSWORD,
    },
  });

  static sendMail(request: EmailRequest) {
    return this.transporter.sendMail({
      from: request.from,
      to: request.to,
      subject: request.subject,
      text: request.text,
      html: request.html,
    });
  }
}
