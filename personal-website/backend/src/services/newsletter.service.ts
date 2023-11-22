import path from 'path';
import ejs from 'ejs';
import { EmailSubscription } from '../models/subscription.model';
import { EncryptionService } from './encryption.service';
import { MailService, DEFAULT_EMAIL_REQUEST } from '@prettydamntired/nodetools';

export class NewsletterService {
  static async subscribeEmail(email: string) {
    const emailSubscription = await EmailSubscription.findOne({
      email: email,
    });
    const isSubscribed = !!emailSubscription;
    if (!isSubscribed) {
      const newEmailAlert = new EmailSubscription({ email, isVerified: false });
      await newEmailAlert.save();
    }
    if (isSubscribed && emailSubscription.isVerified) {
      return 'Email is already verified.';
    }
    await this.sendVerificationEmail(email);
    return 'Please check verification email.';
  }

  static sendVerificationEmail(email: string) {
    const token = EncryptionService.encryptData(email);
    const confirmLink = `${process.env.PERSONAL_WEBSITE_FRONTEND_URL}/verify-email-subscription?token=${token}`;
    const subject = 'Email Verification';

    return ejs
      .renderFile(path.join(__dirname, 'verify-subscribe.ejs'), {
        email: email,
        confirmLink: confirmLink,
        siteUrl: process.env.PERSONAL_WEBSITE_FRONTEND_URL,
      })
      .then(emailTemplate => {
        MailService.sendEmail({
          ...DEFAULT_EMAIL_REQUEST,
          to: email,
          subject,
          html: emailTemplate,
        });
      });
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
