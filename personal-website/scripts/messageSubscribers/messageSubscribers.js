import { MongoClient } from 'mongodb';
import MailService from '../../../scripts/mailService/mailService.js';

const uri = `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@cluster0.txzecw2.mongodb.net/`;
const client = new MongoClient(uri);

const mailService = new MailService(
  'gmail',
  process.env.MY_EMAIL,
  process.env.MY_EMAIL_PASSWORD,
);

async function sendNewsletter() {
  sendEmails(await getEmails());
}
sendNewsletter().catch(console.dir);

async function getEmails() {
  try {
    const database = client.db(process.env.MONGO_DB_NAME);
    const emailSubscriptionsCollection =
      database.collection('emailsubscriptions');

    const emailSubscriptions = await emailSubscriptionsCollection
      .find({})
      .toArray();

    return emailSubscriptions.map(subscription => subscription.email);
  } finally {
    await client.close();
  }
}

function sendEmails(emails) {
  for (let email of emails) {
    mailService.sendEmail(email);
  }
}
