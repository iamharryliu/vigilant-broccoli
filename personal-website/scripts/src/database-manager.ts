import mongoose from 'mongoose';
import {
  DEFAULT_EMAIL_REQUEST,
  MONGO_DB_CLIENT,
  MailService,
  MONGO_DB_SERVER,
  logger,
} from '../../../node/tools/src';
import { EmailSubscription } from '../../common/src';
import {
  PERSONAL_WEBSITE_DB_DATABASES,
  PERSONAL_WEBSITE_DB_COLLECTIONS,
} from '../../common/src/index';

export class DatabaseManager {
  static client = MONGO_DB_CLIENT;
  static async dropEmailSubscriptions(databaseName: string) {
    try {
      const database = this.client.db(databaseName);
      const collection = database.collection(
        PERSONAL_WEBSITE_DB_COLLECTIONS.EMAIL_SUBSCRIPTIONS,
      );
      await collection.drop();
    } finally {
      await this.client.close();
    }
  }

  static async removeOneWeekOldOrOlderUnverifiedUsers() {
    mongoose.connect(
      `${MONGO_DB_SERVER}/${PERSONAL_WEBSITE_DB_DATABASES.PROD}`,
    );
    const db = mongoose.connection;
    db.getClient;
    db.on('error', error => {
      console.error(`MongoDB connection error: ${error}`);
    });
    db.once('open', () => {
      logger.info('Connected to MongoDB');
    });

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    await EmailSubscription.deleteMany({
      dateCreated: { $lt: oneWeekAgo },
      isVerified: false,
    }).then(res => console.log(res));
    db.close();
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
    const database = MONGO_DB_CLIENT.db(PERSONAL_WEBSITE_DB_DATABASES.PROD);
    const emailSubscriptionsCollection = database.collection(
      PERSONAL_WEBSITE_DB_COLLECTIONS.EMAIL_SUBSCRIPTIONS,
    );
    const emailSubscriptions = await emailSubscriptionsCollection
      .find({})
      .toArray();
    return emailSubscriptions.map(subscription => subscription.email);
  }

  static sendEmails(emails: string[]) {
    for (const to of emails) {
      MailService.sendEmail({ ...DEFAULT_EMAIL_REQUEST, to });
    }
  }
}
