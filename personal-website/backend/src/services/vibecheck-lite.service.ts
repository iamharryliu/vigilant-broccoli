import { NewsletterService } from './newsletter.service';
import { VibecheckLite } from '@prettydamntired/vibecheck-lite';
import { EncryptionService } from '@prettydamntired/node-tools';
import { EmailSubscription } from '@prettydamntired/personal-website-types';

export class VibecheckLiteService extends VibecheckLite {
  static async subscribeEmail(data) {
    const { email, latitude, longitude } = data;
    const emailSubscription = await EmailSubscription.findOne({
      email: email,
    });
    const isSubscribed = !!emailSubscription;
    if (!isSubscribed) {
      const newEmailAlert = new EmailSubscription({
        email,
        isVerified: false,
        vibecheckLiteSubscription: {
          latitude,
          longitude,
        },
      });
      await newEmailAlert.save();
      return NewsletterService.sendVerificationEmail(email);
    }
    await EmailSubscription.findOneAndUpdate(
      {
        email: email,
      },
      {
        $set: {
          vibecheckLiteSubscription: {
            latitude,
            longitude,
          },
        },
      },
      { new: true },
    );
    return NewsletterService.subscribeEmail(email);
  }

  static async unsubscribeEmail(email: string) {
    email = EncryptionService.decryptData(email);
    await EmailSubscription.findOneAndUpdate(
      {
        email: email,
      },
      {
        $set: {
          vibecheckLiteSubscription: null,
        },
      },
    );
    return 'Email has been unsubscribed.';
  }
}
