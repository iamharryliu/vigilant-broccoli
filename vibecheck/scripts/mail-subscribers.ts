import mongoose from 'mongoose';
import {
  MONGO_DB_SERVER,
  MailService,
  DEFAULT_EMAIL_REQUEST,
  EncryptionService,
} from '../../node/tools/src';
import {
  PERSONAL_WEBSITE_DB_DATABASES,
  PERSONAL_WEBSITE_URL,
} from '../../personal-website/common/src';
import { VibecheckLite } from '@prettydamntired/vibecheck-lite';
import { EmailSubscription } from '@prettydamntired/personal-website-types';

mongoose.connect(`${MONGO_DB_SERVER}/${PERSONAL_WEBSITE_DB_DATABASES.PROD}`);
const db = mongoose.connection;
db.getClient;
db.on('error', error => {
  console.error(`MongoDB connection error: ${error}`);
});
db.once('open', () => {
  console.info('Connected to MongoDB');
});

main();

async function main() {
  console.log('Vibecheck lite recommendation script start.');
  const emailSubscriptions = (
    await EmailSubscription.find({
      isVerified: { $eq: true },
      vibecheckLiteSubscription: { $exists: true, $ne: null },
    })
  ).map(data => {
    return {
      email: data.email,
      latitude: data.vibecheckLiteSubscription?.latitude,
      longitude: data.vibecheckLiteSubscription?.longitude,
    };
  });
  db.close();

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
      path: `${__dirname}/vibecheck-lite.ejs`,
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
