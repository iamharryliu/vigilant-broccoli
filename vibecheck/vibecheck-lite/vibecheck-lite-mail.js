import db from './mongo-db.js';
import { EmailSubscription } from './vibecheck-lite.model.js';
import { VibecheckLite } from '../vibecheck-lite/vibecheck-lite.js';
import MailService from '../../node-scripts/mailService/mailService.js';

const SUBJECT = `Vibecheck Lite Weather Recommendation`;

const mailService = new MailService(
  'gmail',
  process.env.MY_EMAIL,
  process.env.MY_EMAIL_PASSWORD,
);

let emailSubscriptions = await EmailSubscription.find({
  isVerified: { $eq: true },
  vibecheckLiteSubscription: { $exists: true, $ne: null },
});
db.close();

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
  console.log(`Getting outfit recommendation for ${emailSubscription.email}`);
  const message = await VibecheckLite.getOutfitRecommendation({
    latitude,
    longitude,
  });
  console.log(`Sending email to ${emailSubscription.email}.`);
  mailService.sendEmail(emailSubscription.email, SUBJECT, message);
}

for (let emailSubscription of emailSubscriptions) {
  emailSubscriber(emailSubscription);
}
