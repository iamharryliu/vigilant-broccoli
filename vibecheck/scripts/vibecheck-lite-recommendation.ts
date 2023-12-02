import {
  MailService,
  DEFAULT_EMAIL_REQUEST,
  EncryptionService,
  MONGO_DB_CLIENT,
} from '../../node/tools/src';
import {
  PERSONAL_WEBSITE_DB_COLLECTIONS,
  PERSONAL_WEBSITE_DB_DATABASES,
  PERSONAL_WEBSITE_URL,
} from '../../personal-website/common/src';
import { VibecheckLite } from '@prettydamntired/vibecheck-lite';

main();

async function main() {
  console.log('Vibecheck lite recommendation script start.');
  const database = MONGO_DB_CLIENT.db(PERSONAL_WEBSITE_DB_DATABASES.PROD);
  const emailSubscriptionsCollection = database.collection(
    PERSONAL_WEBSITE_DB_COLLECTIONS.EMAIL_SUBSCRIPTIONS,
  );
  const subscriptionQuery = {
    isVerified: { $eq: true },
    vibecheckLiteSubscription: { $exists: true, $ne: null },
  };
  const emailSubscriptions = (
    await emailSubscriptionsCollection.find(subscriptionQuery).toArray()
  ).map(data => {
    return {
      email: data.email,
      latitude: data.vibecheckLiteSubscription?.latitude,
      longitude: data.vibecheckLiteSubscription?.longitude,
    };
  });

  const emailPromises = emailSubscriptions.map(async emailSubscription => {
    const { email, latitude, longitude } = emailSubscription;
    console.log(`Getting outfit recommendation for ${email}`);
    const subject = 'Vibecheck Lite Outfit Recommendation';
    const request = {
      ...DEFAULT_EMAIL_REQUEST,
      to: email,
      subject,
    };
    const recommendation = (await VibecheckLite.getOutfitRecommendation({
      latitude: latitude as number,
      longitude: longitude as number,
    })) as string;
    const token = EncryptionService.encryptData(email);
    const template = {
      path: `${__dirname}/assets/vibecheck-lite.ejs`,
      data: {
        recommendation: recommendation,
        url: `${PERSONAL_WEBSITE_URL.FRONTEND_REDIRECTED}/unsubscribe-vibecheck-lite?token=${token}`,
      },
    };
    console.log(`Sending email to ${email}`);
    return MailService.sendEjsEmail(request, template);
  });

  await Promise.all(emailPromises);
}
