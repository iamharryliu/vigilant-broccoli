import { Db, MongoClient } from 'mongodb';
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
  }
  async deleteOneWeekOldOrOlderUnverifiedUsers() {
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
  }
}
