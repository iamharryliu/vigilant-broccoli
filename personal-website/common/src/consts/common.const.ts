export const PERSONAL_WEBSITE_URL = {
  BACKEND: 'https://old-wind-7127.fly.dev',
  FRONTEND: 'https://vigilant-broccoli.pages.dev',
  FRONTEND_REDIRECTED: 'https://harryliu.design',
};
export const PERSONAL_WEBSITE_DB_DATABASES = {
  DEV: 'test',
  PROD: 'personal-website-db',
};

export const PERSONAL_WEBSITE_DB_COLLECTIONS = {
  EMAIL_SUBSCRIPTIONS: 'emailSubscriptions'.toLowerCase(),
};

const VIBECHECK_LITE_ENDPOINTS = {
  SUBSCRIBE_TO_VIBECHECK_LITE: '/vibecheck-lite/subscribe',
  UNSUBSCRIBE_FROM_VIBECHECK_LITE: '/vibecheck-lite/unsubscribe',
  GET_OUTFIT_RECOMMENDATION: '/vibecheck-lite/get-outfit-recommendation',
};

export const PERSONAL_WEBSITE_BACKEND_ENDPOINTS = {
  SEND_MESSAGE: '/contact/send-message',
  SUBSCRIBE: '/subscribe/email-alerts',
  VERIFY_SUBSCRIPTION: '/subscribe/verify-email-subscription',
  ...VIBECHECK_LITE_ENDPOINTS,
};
