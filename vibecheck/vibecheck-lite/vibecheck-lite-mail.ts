import db from './mongo-db';
import { EmailSubscription } from './vibecheck-lite.model';
import { VibecheckLite } from './vibecheck-lite';
import MailService from '../../node-scripts/mail-service/mail.service';

const SUBJECT = `Vibecheck Lite Weather Recommendation`;

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

  async function emailSubscriber(emailSubscription) {
    const latitude = emailSubscription.latitude;
    const longitude = emailSubscription.longitude;
    console.log(`Getting outfit recommendation for ${emailSubscription.email}`);
    const message = await VibecheckLite.getOutfitRecommendation({
      latitude,
      longitude,
    });
    console.log(`Sending email to ${emailSubscription.email}.`);
    mailService.sendEmail(emailSubscription.email, SUBJECT, message as string);
  }

  for (const emailSubscription of emailSubscriptions) {
    emailSubscriber(emailSubscription);
  }
}

main();
