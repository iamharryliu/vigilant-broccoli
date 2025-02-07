import { DEFAULT_APP_EMAIL_CONFIG } from '@prettydamntired/personal-website-api-lib';
import { IS_DEV_ENV } from '../configs/app.const';
import { MessageRequest } from '@prettydamntired/personal-website-lib';
import {
  DEFAULT_EMAIL_REQUEST,
  Email,
  EmailService,
} from '@vigilant-broccoli/common-node';

export class ContactService {
  static async sendMessage(request: MessageRequest) {
    const email = {
      ...DEFAULT_APP_EMAIL_CONFIG[request.appName],
      ...request,
    } as Email;
    const { from, to, subject, text, html } = email;
    if (!IS_DEV_ENV) {
      const mailService = new EmailService();
      await mailService.sendEmail({
        ...DEFAULT_EMAIL_REQUEST,
        from,
        to,
        subject,
        text,
        html,
      });
    }
  }
}
