import nodemailer from 'nodemailer';

export default class MailService {
  transporter;
  constructor(
    serviceName = 'gmail',
    email = process.env.MY_EMAIL,
    password = process.env.MY_EMAIL_PASSWORD,
  ) {
    this.transporter = nodemailer.createTransport({
      service: serviceName,
      auth: {
        user: email,
        pass: password,
      },
    });
  }

  async sendEmail(
    email = process.env.MY_EMAIL,
    subject = 'Default subject',
    message = 'Default message',
  ) {
    const mailOption = {
      from: process.env.MY_EMAIL,
      to: email,
      subject: subject,
      text: message,
    };
    this.transporter.sendMail(mailOption, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  }
}
