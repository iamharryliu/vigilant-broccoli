import { Db, MongoClient } from 'mongodb';
import {
  DEFAULT_EMAIL_REQUEST,
  EmailService,
  logger,
} from '@prettydamntired/test-node-tools';
import {
  MONGO_DB_SERVER,
  PERSONAL_WEBSITE_DB_COLLECTIONS,
  PERSONAL_WEBSITE_DB_NAME,
} from '../database/database.const';

export class DatabaseManager {
  private client: MongoClient;
  private database: Db;
  constructor() {
    this.client = new MongoClient(MONGO_DB_SERVER);
    this.database = this.client.db(PERSONAL_WEBSITE_DB_NAME.PROD);
  }
  async runGarbageCollector() {
    await this.deleteOneWeekOldOrOlderUnverifiedUsers();
    await this.deleteOutdatedLogs();
  }
  async deleteOneWeekOldOrOlderUnverifiedUsers() {
    logger.info('Deleting unverified users started.');
    const emailSubscriptionsCollection = this.database.collection(
      PERSONAL_WEBSITE_DB_COLLECTIONS.EMAIL_SUBSCRIPTIONS,
    );
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    await emailSubscriptionsCollection.deleteMany({
      dateCreated: { $lt: oneWeekAgo },
      isVerified: false,
    });
    await this.client.close();
    logger.info('Deleting unverified users completed.');
  }

  async deleteOutdatedLogs() {
    logger.info('Deleting outdated logs started.');
    logger.info('Deleting outdated logs completed.');
  }

  async sendNewsletter() {
    logger.info('sendNewsletter: start');
    try {
      logger.info('getEmails: start');
      const emails = await this.getEmails();
      logger.info('getEmails - successful');

      logger.info(`sendEmails: start, emailing ${emails.length} subscriber(s)`);
      this.sendEmails(emails);
      logger.info('sendEmails: successful');
    } finally {
      await this.client.close();
      logger.info('sendNewsletter: unsuccessful');
    }
  }

  async getEmails() {
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

  sendEmails(emails: string[]) {
    const emailService = new EmailService();
    for (const to of emails) {
      emailService.sendEmail({ ...DEFAULT_EMAIL_REQUEST, to });
    }
  }
}
