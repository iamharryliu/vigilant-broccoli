import { MongoClient } from 'mongodb';
import {
  DEFAULT_EMAIL_REQUEST,
  MailService,
} from '@prettydamntired/node-tools';
import {
  PERSONAL_WEBSITE_DB_COLLECTIONS,
  PERSONAL_WEBSITE_DB_DATABASES,
} from '@prettydamntired/test-lib';

const MONGO_DB_SERVER = `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@cluster0.txzecw2.mongodb.net`;
const MONGO_DB_CLIENT = new MongoClient(MONGO_DB_SERVER);

export class DatabaseManager {
  static database = MONGO_DB_CLIENT.db(PERSONAL_WEBSITE_DB_DATABASES.PROD);
  static async runGarbageCollector() {
    await this.deleteOneWeekOldOrOlderUnverifiedUsers();
    await this.deleteOutdatedLogs();
  }
  static async deleteOneWeekOldOrOlderUnverifiedUsers() {
    console.log('Deleting unverified users started.');
    const emailSubscriptionsCollection = this.database.collection(
      PERSONAL_WEBSITE_DB_COLLECTIONS.EMAIL_SUBSCRIPTIONS,
    );
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    await emailSubscriptionsCollection
      .deleteMany({
        dateCreated: { $gt: oneWeekAgo },
        isVerified: false,
      })
      .then(res => console.log(res));
    await MONGO_DB_CLIENT.close();
    console.log('Deleting unverified users completed.');
  }

  static async deleteOutdatedLogs() {
    console.log('Deleting outdated logs started.');
    console.log('Deleting outdated logs completed.');
  }

  static async sendNewsletter() {
    console.log('Sending newsletter started.');
    try {
      console.log('Retrieving emails started.');
      const emails = await this.getEmails();
      console.log('Retrieving emails completed.');
      console.log('Sending emails started.');
      console.log(`Emailing ${emails.length} subscriber(s).`);
      this.sendEmails(emails);
      console.log('Sending emails completed.');
    } finally {
      await MONGO_DB_CLIENT.close();
      console.log('Sending newsletter completed.');
    }
  }

  static async getEmails() {
    const emailSubscriptionsCollection = this.database.collection(
      PERSONAL_WEBSITE_DB_COLLECTIONS.EMAIL_SUBSCRIPTIONS,
    );
    const emailSubscriptions = await emailSubscriptionsCollection
      .find({
        isVerified: true,
      })
      .toArray();
    return emailSubscriptions.map(subscription => subscription.email);
  }

  static sendEmails(emails: string[]) {
    for (const to of emails) {
      MailService.sendEmail({ ...DEFAULT_EMAIL_REQUEST, to });
    }
  }
}
