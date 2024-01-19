import mongoose from 'mongoose';

export function testLib(): string {
  return 'test-lib';
}

const VIBECHECK_LITE_ENDPOINTS = {
  SUBSCRIBE_TO_VIBECHECK_LITE: '/vibecheck-lite/subscribe',
  UNSUBSCRIBE_FROM_VIBECHECK_LITE: '/vibecheck-lite/unsubscribe',
  GET_OUTFIT_RECOMMENDATION: '/get-outfit-recommendation',
};

export const PERSONAL_WEBSITE_BACKEND_ENDPOINTS = {
  SEND_MESSAGE: '/contact/send-message',
  SUBSCRIBE: '/subscribe/email-alerts',
  VERIFY_SUBSCRIPTION: '/subscribe/verify-email-subscription',
  ...VIBECHECK_LITE_ENDPOINTS,
};

const emailSubscriptionSchema = new mongoose.Schema({
  email: { type: String, required: true },
  isVerified: Boolean,
  dateCreated: Date,
  vibecheckLiteSubscription: {
    latitude: Number,
    longitude: Number,
  },
});

export const EmailSubscription = mongoose.model(
  'EmailSubscription',
  emailSubscriptionSchema
);

export const PERSONAL_WEBSITE_DB_DATABASES = {
  DEV: 'test',
  PROD: 'personal-website-db',
};

export const PERSONAL_WEBSITE_DB_COLLECTIONS = {
  EMAIL_SUBSCRIPTIONS: 'emailSubscriptions'.toLowerCase(),
};
