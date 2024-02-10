import {
  EmailService,
  DEFAULT_EMAIL_REQUEST,
} from '@prettydamntired/test-node-tools';
import { IS_DEV_ENV } from '../configs/app.const';
import { MessageRequest } from '@prettydamntired/personal-website-lib';

export class ContactService {
  static async sendMessage(request: MessageRequest) {
    const { name, email, message } = request;
    const from = `'${name}' <youremail@gmail.com>`;
    const subject = 'Message from personal website.';
    const text = `Name: ${name}\nEmail: ${email}\nMessage: ${message}`;
    if (!IS_DEV_ENV) {
      const mailService = new EmailService();
      await mailService.sendEmail({
        ...DEFAULT_EMAIL_REQUEST,
        from,
        subject,
        text,
      });
    }
  }
}
