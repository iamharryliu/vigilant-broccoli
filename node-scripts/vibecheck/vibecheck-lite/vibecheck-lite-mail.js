import db from './mongo-db.js';
import { EmailSubscription } from './vibecheck-lite.model.js';
import { VibecheckLite } from '../vibecheck-lite/vibecheck-lite.js';
import MailService from '../../mailService/mailService.js';

const SUBJECT = `Vibecheck Lite Weather Recommendation`;

const mailService = new MailService(
  'gmail',
  process.env.MY_EMAIL,
  process.env.MY_EMAIL_PASSWORD,
);

let emailSubscriptions = await EmailSubscription.find({
  isVerified: true,
  vibecheckLiteSubscription: { $exists: true, $ne: null },
});
emailSubscriptions = emailSubscriptions.map(data => {
  return {
    email: data.email,
    latitude: data.vibecheckLiteSubscription.latitude,
    longitude: data.vibecheckLiteSubscription.longitude,
  };
});

async function emailSubscriber(emailSubscription) {
  const latitude = emailSubscription.latitude;
  const longitude = emailSubscription.longitude;
  const message = await VibecheckLite.getOutfitRecommendation({
    latitude,
    longitude,
  });
  mailService.sendEmail(emailSubscription.email, SUBJECT, message);
}

for (let emailSubscription of emailSubscriptions) {
  emailSubscriber(emailSubscription);
}

db.close();
