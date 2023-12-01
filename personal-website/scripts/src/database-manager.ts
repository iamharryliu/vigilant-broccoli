import {
  DEFAULT_EMAIL_REQUEST,
  MONGO_DB_CLIENT,
  MailService,
} from '../../../node/tools/src';
import {
  PERSONAL_WEBSITE_DB_DATABASES,
  PERSONAL_WEBSITE_DB_COLLECTIONS,
} from '../../common/src';

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
