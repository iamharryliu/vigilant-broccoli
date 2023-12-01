import mongoose from 'mongoose';
import { EmailSubscription } from '@prettydamntired/personal-website-types';
import { MONGO_DB_SERVER, logger } from '../../../node/tools/src/index';
import { PERSONAL_WEBSITE_DB_DATABASES } from '../../common/src/index';

mongoose.connect(`${MONGO_DB_SERVER}/${PERSONAL_WEBSITE_DB_DATABASES.PROD}`);
export const db = mongoose.connection;
db.getClient;
db.on('error', error => {
  console.error(`MongoDB connection error: ${error}`);
});
db.once('open', () => {
  logger.info('Connected to MongoDB');
});

const oneWeekAgo = new Date();
oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

main();

async function main() {
  await EmailSubscription.deleteMany({
    dateCreated: { $lt: oneWeekAgo },
    isVerified: false,
  }).then(res => console.log(res));
  db.close();
}
