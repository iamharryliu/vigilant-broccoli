import path from 'path';
import {
  DEFAULT_EMAIL_REQUEST,
  EncryptionService,
  EmailService,
} from '@prettydamntired/test-node-tools';
import { EmailSubscription } from '@prettydamntired/personal-website-api-lib';
import { IS_DEV_ENV } from '../configs/app.const';

export class NewsletterService {
  static async subscribeEmail(email: string) {
    const emailSubscription = await EmailSubscription.findOne({
      email: email,
    });
    const isSubscribed = !!emailSubscription;
    const dateCreated = new Date();
    if (!isSubscribed) {
      const newEmailAlert = new EmailSubscription({
        email,
        dateCreated,
        isVerified: false,
      });
      await newEmailAlert.save();
    }
    if (isSubscribed && emailSubscription.isVerified) {
      return 'Email is already verified.';
    }
    if (!IS_DEV_ENV) {
      await this.sendVerificationEmail(email);
    }
    return 'Please check verification email.';
  }

  static async sendVerificationEmail(email: string) {
    const encryptionService = new EncryptionService();
    const token = encryptionService.encryptData(email);
    const frontendUrl = IS_DEV_ENV
      ? 'http://localhost:4200'
      : 'https://harryliu.design';
    const confirmLink = `${frontendUrl}/verify-email-subscription?token=${token}`;
    const subject = 'Email Verification';
    const template = {
      path: path.join(__dirname, '../assets/verify-subscribe.ejs'),
      data: {
        email: email,
        confirmLink: confirmLink,
        siteUrl: frontendUrl,
      },
    };
    const mailService = new EmailService();
    return mailService.sendEjsEmail(
      {
        ...DEFAULT_EMAIL_REQUEST,
        from: `harryliu.design <${process.env.MY_EMAIL}>`,
        to: email,
        subject,
      },
      template,
    );
  }

  static verifyEmail(token: string) {
    const encryptionService = new EncryptionService();
    const email = encryptionService.decryptData(token);
    return EmailSubscription.findOneAndUpdate(
      {
        email: email,
      },
      { email, isVerified: true },
      { new: true },
    );
  }
}
