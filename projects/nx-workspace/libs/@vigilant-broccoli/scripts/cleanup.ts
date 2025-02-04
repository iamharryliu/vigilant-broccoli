/* eslint-disable @nx/enforce-module-boundaries */
import { DatabaseManager } from '../../@prettydamntired/personal-website-api-lib/src';
import { logger } from '../common-node/src';

main();

async function main() {
  logger.debug('Cleanup started.');
  try {
    const databaseManagager = new DatabaseManager();
    await databaseManagager.runGarbageCollector();
  } catch (error) {
    logger.error(`Error: ${error}`);
  }
}
