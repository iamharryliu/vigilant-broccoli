
import MailService from  '@prettydamntired/nodetools/lib/mail-service/mail.service'
import { DEFAULT_EMAIL_REQUEST } from  '@prettydamntired/nodetools/lib/mail-service/mail.model'

export class MessageService {
  static sendMessage(body) {
    const { name, email, message } = body;
    const from = `'${name}' <youremail@gmail.com>`;
    const subject = 'Message from personal website.';
    const text = `Name: ${name}\nEmail: ${email}\nMessage: ${message}`;
    MailService.sendEmail({
      ...DEFAULT_EMAIL_REQUEST,
      from,
      subject,
      text,
    });
  }
}
