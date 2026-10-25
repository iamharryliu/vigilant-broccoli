const MOBILE_USER_AGENT_REGEX =
  /Android|iPhone|iPad|iPod|IEMobile|BlackBerry|Opera Mini/i;

export const isMobileUserAgent = (userAgent: string) =>
  MOBILE_USER_AGENT_REGEX.test(userAgent);

const ANDROID_PHONE_USER_AGENT_REGEX = /Android.*Mobile/i;
const PHONE_USER_AGENT_REGEX = /iPhone|iPod|IEMobile|BlackBerry|Opera Mini/i;

// Android tablets omit "Mobile" from the user agent, and iPads are excluded
// by not matching iPad.
export const isPhoneUserAgent = (userAgent: string) =>
  PHONE_USER_AGENT_REGEX.test(userAgent) ||
  ANDROID_PHONE_USER_AGENT_REGEX.test(userAgent);
