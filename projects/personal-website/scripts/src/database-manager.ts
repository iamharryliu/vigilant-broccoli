import { MongoClient } from 'mongodb';
import {
  DEFAULT_EMAIL_REQUEST,
  EmailService,
  logger,
} from '@prettydamntired/test-node-tools';
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
    logger.info('Deleting unverified users started.');
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
      .then(res => logger.info(res));
    await MONGO_DB_CLIENT.close();
    logger.info('Deleting unverified users completed.');
  }

  static async deleteOutdatedLogs() {
    logger.info('Deleting outdated logs started.');
    logger.info('Deleting outdated logs completed.');
  }

  static async sendNewsletter() {
    logger.info('sendNewsletter: start');
    try {
      logger.info('getEmails: start');
      const emails = await this.getEmails();
      logger.info('getEmails - successful');

      logger.info(`sendEmails: start, emailing ${emails.length} subscriber(s)`);
      this.sendEmails(emails);
      logger.info('sendEmails: successful');
    } finally {
      await MONGO_DB_CLIENT.close();
      logger.info('sendNewsletter: unsuccessful');
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
    const emailService = new EmailService();
    for (const to of emails) {
      emailService.sendEmail({ ...DEFAULT_EMAIL_REQUEST, to });
    }
  }
}
