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
