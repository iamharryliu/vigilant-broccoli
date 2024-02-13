export const MONGO_DB_SERVER = `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@cluster0.txzecw2.mongodb.net`;

export const PERSONAL_WEBSITE_DB_DATABASES = {
  DEV: 'personal-website-db-dev',
  PROD: 'personal-website-db',
};

export const VIBECHECK_LITE_DB_NAME = {
  DEV: 'vibecheck-lite-db-dev',
  PROD: 'vibecheck-lite-db',
};

export const PERSONAL_WEBSITE_DB_COLLECTIONS = {
  EMAIL_SUBSCRIPTIONS: 'emailSubscriptions'.toLowerCase(),
};
