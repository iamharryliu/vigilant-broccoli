import { DEFAULT_EMAIL_REQUEST } from '../models/email.model';
import { MailTransportService } from './email.service';

export class MessageService {
  static sendMessage(body) {
    const { name, email, message } = body;
    const from = `'${name}' <youremail@gmail.com>`;
    const subject = 'Message from personal website.';
    const text = `Name: ${name}\nEmail: ${email}\nMessage: ${message}`;
    return MailTransportService.sendMail({
      ...DEFAULT_EMAIL_REQUEST,
      from,
      subject,
      text,
    });
  }
}
