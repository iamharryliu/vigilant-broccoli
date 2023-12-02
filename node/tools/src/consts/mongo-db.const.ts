import { MongoClient } from 'mongodb';

export const MONGO_DB_SERVER = `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@cluster0.txzecw2.mongodb.net`;

export const MONGO_DB_CLIENT = new MongoClient(MONGO_DB_SERVER);
