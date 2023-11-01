import nodemailer from 'nodemailer';

export default class MailService {
  constructor(serviceName, email, password) {
    this.transporter = nodemailer.createTransport({
      service: serviceName,
      auth: {
        user: email,
        pass: password,
      },
    });
  }

  sendEmail(email, subject = 'subject', message = 'message') {
    const mailOptions = {
      from: process.env.MY_EMAIL,
      to: email,
      subject: subject,
      text: message,
    };
    this.transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  }
}
