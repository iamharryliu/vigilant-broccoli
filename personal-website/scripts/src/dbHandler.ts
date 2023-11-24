import { MongoClient } from 'mongodb';
import { COLLECTION_NAME } from '../common';

const URL = `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@cluster0.txzecw2.mongodb.net/`;
const client = new MongoClient(URL);

dropEmailSubscriptions();

async function dropEmailSubscriptions() {
  try {
    const database = client.db(process.env.MONGO_DB_NAME);
    const collection = database.collection(COLLECTION_NAME.EMAIL_SUBSCRIBERS);
    await collection.drop();
  } finally {
    await client.close();
  }
}
