import {
  DEFAULT_EMAIL_REQUEST,
  MailService,
  MONGO_DB_CLIENT,
} from '../../../node/tools/src/index';
import {
  PERSONAL_WEBSITE_DB_DATABASES,
  PERSONAL_WEBSITE_DB_COLLECTIONS,
} from '../../common/src/index';
sendNewsletter();

async function sendNewsletter() {
  try {
    const emails = await getEmails();
    sendEmails(emails);
  } finally {
    await MONGO_DB_CLIENT.close();
  }
}

async function getEmails() {
  const database = MONGO_DB_CLIENT.db(PERSONAL_WEBSITE_DB_DATABASES.PROD);
  const emailSubscriptionsCollection = database.collection(
    PERSONAL_WEBSITE_DB_COLLECTIONS.EMAIL_SUBSCRIPTIONS,
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
