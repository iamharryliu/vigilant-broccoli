import mongoose from 'mongoose';
import {
  MONGO_DB_SERVER,
  MONGO_DB_SETTINGS,
  MailService,
  DEFAULT_EMAIL_REQUEST,
} from '@prettydamntired/node-tools';
import {
  VibecheckLite,
  EmailSubscription,
} from '@prettydamntired/vibecheck-lite';
mongoose.connect(MONGO_DB_SERVER, MONGO_DB_SETTINGS);
const db = mongoose.connection;
db.getClient;
db.on('error', error => {
  console.error(`MongoDB connection error: ${error}`);
});
db.once('open', () => {
  console.info('Connected to MongoDB');
});

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
    const to = email as string;
    const subject = 'Vibecheck Lite Outfit Recommendation';
    const text = (await VibecheckLite.getOutfitRecommendation({
      latitude: latitude as number,
      longitude: longitude as number,
    })) as string;
    console.log(`Sending email to ${email}`);
    return MailService.sendEmail({
      ...DEFAULT_EMAIL_REQUEST,
      to,
      subject,
      text,
    });
  });

  await Promise.all(emailPromises);
}

main();
