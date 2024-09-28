// eslint-disable-next-line @nx/enforce-module-boundaries
import { logger } from '../test-node-tools/src';
import { DatabaseManager } from './src';

main();

async function main() {
  logger.debug('Garbage collector started.');
  try {
    const databaseManagager = new DatabaseManager();
    await databaseManagager.runGarbageCollector();
  } catch (error) {
    logger.error(`Error: ${error}`);
  }
}
