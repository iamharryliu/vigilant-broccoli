import { MongoClient } from 'mongodb';
import {
  PERSONAL_WEBSITE_DB_COLLECTIONS,
  PERSONAL_WEBSITE_DB_DATABASES,
} from '../../../personal-website/common/src/index';
import { MONGO_DB_SERVER } from '../../../node/tools/src';

const client = new MongoClient(
  `${MONGO_DB_SERVER}/${PERSONAL_WEBSITE_DB_DATABASES.PROD}`,
);

main();

async function main() {
  try {
    const database = client.db(process.env.MONGO_DB_NAME);
    const collection = database.collection(
      PERSONAL_WEBSITE_DB_COLLECTIONS.EMAIL_SUBSCRIPTIONS,
    );
    await collection.drop();
  } finally {
    await client.close();
  }
}
