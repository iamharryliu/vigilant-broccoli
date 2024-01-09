import { MongoClient } from 'mongodb';
import {
  MailService,
  DEFAULT_EMAIL_REQUEST,
  logger,
} from '../../node/tools/src';
import { PERSONAL_WEBSITE_DB_COLLECTIONS } from '../../personal-website/common/src';
import { VibecheckLite } from '../vibecheck-lite/src';

const MONGO_DB_SERVER = `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@cluster0.txzecw2.mongodb.net`;
const MONGO_DB_CLIENT = new MongoClient(MONGO_DB_SERVER);

main();

async function main() {
  logger.info('Vibecheck lite recommendation script start.');
  const database = MONGO_DB_CLIENT.db('vibecheck-lite');
  const emailSubscriptionsCollection = database.collection(
    PERSONAL_WEBSITE_DB_COLLECTIONS.EMAIL_SUBSCRIPTIONS,
  );
  const emailSubscriptions = (
    await emailSubscriptionsCollection.find({}).toArray()
  ).map(data => {
    return {
      email: data.email,
      latitude: data.latitude,
      longitude: data.longitude,
    };
  });

  const emailPromises = emailSubscriptions.map(async emailSubscription => {
    const { email, latitude, longitude } = emailSubscription;
    logger.info(`Getting outfit recommendation for ${email}`);
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
    const template = {
      path: `${__dirname}/assets/vibecheck-lite.ejs`,
      data: {
        recommendation: recommendation,
        url: `https://harryliu.design/unsubscribe-vibecheck-lite?token=${email}`,
      },
    };
    logger.info(`Sending email to ${email}`);
    return MailService.sendEjsEmail(request, template);
  });

  await Promise.all(emailPromises);
  await MONGO_DB_CLIENT.close();
}
