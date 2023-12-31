import path from 'path';
import {
  DEFAULT_EMAIL_REQUEST,
  EncryptionService,
  MailService,
} from '@prettydamntired/node-tools';
import { EmailSubscription } from '@prettydamntired/personal-website-common';

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
    await this.sendVerificationEmail(email);
    return 'Please check verification email.';
  }

  static async sendVerificationEmail(email: string) {
    const token = EncryptionService.encryptData(email);
    const confirmLink = `${process.env.PERSONAL_WEBSITE_FRONTEND_URL}/verify-email-subscription?token=${token}`;
    const subject = 'Email Verification';
    const template = {
      path: path.join(__dirname, 'verify-subscribe.ejs'),
      data: {
        email: email,
        confirmLink: confirmLink,
        siteUrl: process.env.PERSONAL_WEBSITE_FRONTEND_URL,
      },
    };

    return MailService.sendEjsEmail(
      { ...DEFAULT_EMAIL_REQUEST, to: email, subject },
      template,
    );
  }

  static verifyEmail(email: string) {
    return EmailSubscription.findOneAndUpdate(
      {
        email: email,
      },
      { email, isVerified: true },
      { new: true },
    );
  }
}
