import { NewsletterService } from './newsletter.service';
import { EmailSubscription } from '../models/subscription.model';
import VibecheckLite from '@prettydamntired/vibecheck-lite/lib/vibecheck-lite'

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
          vibecheckLiteSubscription: true,
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
            vibecheckLiteSubscription: true,
            latitude,
            longitude,
          },
        },
      },
      { new: true },
    );
    return NewsletterService.subscribeEmail(email);
  }
}
