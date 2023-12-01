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
    await this.removeOneWeekOldOrOlderUnverifiedUsers();
    await this.deleteOutdatedLogs();
  }
  static async removeOneWeekOldOrOlderUnverifiedUsers() {
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
  }

  static async deleteOutdatedLogs() {
    console.log('Deleting outdated logs started.');
    console.log('Deleting outdated logs completed.');
  }

  static async sendNewsletter() {
    try {
      const emails = await this.getEmails();
      this.sendEmails(emails);
    } finally {
      await MONGO_DB_CLIENT.close();
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
