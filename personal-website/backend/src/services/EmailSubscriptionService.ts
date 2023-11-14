import path from 'path';
import ejs from 'ejs';
import { DEFAULT_EMAIL_REQUEST } from '../models/email.model';
import { EmailSubscription } from '../models/subscription.model';
import { EncryptionService } from './EncryptionService';
import { MailTransportService } from './MailTransportService';

export class EmailSubscriptionService {
  static async subscribeEmail(email: string) {
    const emailSubscription = await EmailSubscription.findOne({
      email: email,
    });
    const isSubscribed = !!emailSubscription;
    if (!isSubscribed) {
      const newEmailAlert = new EmailSubscription({ email, isVerified: false });
      await newEmailAlert.save();
    }
    return this.sendVerificationEmail(email);
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
        return MailTransportService.sendMail({
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
