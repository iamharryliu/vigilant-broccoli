import { MongoClient, Db } from 'mongodb';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';

const MONGODB_URI = 'MONGODB_URI';
const MONGODB_DB = 'MONGODB_DB';
const DEFAULT_DB_NAME = 'vb-manager';

const globalForMongo = global as typeof global & {
  _mongoClientPromise?: Promise<MongoClient>;
};

const getClientPromise = (): Promise<MongoClient> => {
  if (!globalForMongo._mongoClientPromise) {
    const client = new MongoClient(getEnvironmentVariable(MONGODB_URI));
    globalForMongo._mongoClientPromise = client.connect();
  }
  return globalForMongo._mongoClientPromise;
};

export const getDb = async (): Promise<Db> => {
  const client = await getClientPromise();
  const dbName = process.env[MONGODB_DB] || DEFAULT_DB_NAME;
  return client.db(dbName);
};
