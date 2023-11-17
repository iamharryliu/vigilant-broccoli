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

  const emailPromises = emailSubscriptions.map(async emailSubscription => {
    const { email, latitude, longitude } = emailSubscription;
    console.log(`Getting outfit recommendation for ${email}`);
    const message = await VibecheckLite.getOutfitRecommendation({
      latitude,
      longitude,
    });
    console.log(`Sending email to ${email}.`);
    return mailService.sendEmail(email, SUBJECT, message as string);
  });

  await Promise.all(emailPromises);
}

main();
