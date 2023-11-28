import {
  DEFAULT_EMAIL_REQUEST,
  MailService,
} from '@prettydamntired/node-tools';
import { COLLECTION_NAME, client } from '../common';
sendNewsletter();

async function sendNewsletter() {
  try {
    const emails = await getEmails();
    sendEmails(emails);
  } finally {
    await client.close();
  }
}

async function getEmails() {
  const database = client.db(process.env.MONGO_DB_NAME);
  const emailSubscriptionsCollection = database.collection(
    COLLECTION_NAME.EMAIL_SUBSCRIBERS,
  );
  const emailSubscriptions = await emailSubscriptionsCollection
    .find({})
    .toArray();
  return emailSubscriptions.map(subscription => subscription.email);
}

function sendEmails(emails: string[]) {
  for (const to of emails) {
    MailService.sendEmail({ ...DEFAULT_EMAIL_REQUEST, to });
  }
}
