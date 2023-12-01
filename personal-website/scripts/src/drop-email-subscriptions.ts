import { PERSONAL_WEBSITE_DB_DATABASES } from '../../../personal-website/common/src';
import { DatabaseManager } from './database-manager';

DatabaseManager.dropEmailSubscriptions(PERSONAL_WEBSITE_DB_DATABASES.PROD);
