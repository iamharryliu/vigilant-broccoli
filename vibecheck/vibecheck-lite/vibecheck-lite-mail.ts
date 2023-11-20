import mongoose from 'mongoose';
import {
  MONGO_DB_SERVER,
  MONGO_DB_SETTINGS,
} from '../../node-scripts/general-services/mongo-db';
import { EmailSubscription } from './vibecheck-lite.model';
import VibecheckLite from './vibecheck-lite';
import MailService from '../../node-scripts/general-services/mail.service';

mongoose.connect(MONGO_DB_SERVER, MONGO_DB_SETTINGS);
const db = mongoose.connection;
db.getClient;
db.on('error', error => {
  console.error(`MongoDB connection error: ${error}`);
});
db.once('open', () => {
  console.info('Connected to MongoDB');
});

const mailService = new MailService(
  'gmail',
  process.env.MY_EMAIL,
  process.env.MY_EMAIL_PASSWORD,
);

async function main() {
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
    const message = await VibecheckLite.getOutfitRecommendation({
      latitude,
      longitude,
    });
    console.log(`Sending email to ${email}.`);
    return mailService.sendEmail(
      email,
      `Vibecheck Lite Outfit Recommendation`,
      message as string,
    );
  });

  await Promise.all(emailPromises);
}

main();
