import { MongoClient } from 'mongodb';

const URL = `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@cluster0.txzecw2.mongodb.net/`;
export const client = new MongoClient(URL);

export const COLLECTION_NAME = {
  EMAIL_SUBSCRIBERS: 'emailSubscriptions',
};
