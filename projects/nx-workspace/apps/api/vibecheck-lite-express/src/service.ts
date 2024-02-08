import { EmailSubscription } from '@prettydamntired/personal-website-api-lib';
import { Location } from '@prettydamntired/test-lib';
import { VibecheckLite } from '@prettydamntired/vibecheck-lite';

export class Service {
  static async getOutfitRecommendation(location: Location) {
    const latitude = Number(location.latitude);
    const longitude = Number(location.longitude);
    const vibecheckLite = new VibecheckLite();
    const recommendation = await vibecheckLite.getOutfitRecommendation({
      latitude,
      longitude,
    });
    return recommendation;
  }

  static async getIsSubscribed(email: string) {
    return !!(await EmailSubscription.findOne({
      email: email,
    }));
  }

  static async subscribe(email: string, location: Location) {
    const newEmailAlert = new EmailSubscription({
      email,
      latitude: location.latitude,
      longitude: location.longitude,
    });
    await newEmailAlert.save();
  }

  static async updateSubscription(email: string, location: Location) {
    await EmailSubscription.findOneAndUpdate(
      {
        email: email,
      },
      {
        $set: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
      },
      { new: true },
    );
  }

  static async unsubscribe(email: string) {
    await EmailSubscription.findOneAndDelete({ email });
  }
}
