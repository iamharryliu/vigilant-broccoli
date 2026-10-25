const MOBILE_USER_AGENT_REGEX =
  /Android|iPhone|iPad|iPod|IEMobile|BlackBerry|Opera Mini/i;

export const isMobileUserAgent = (userAgent: string) =>
  MOBILE_USER_AGENT_REGEX.test(userAgent);

const ANDROID_REGEX = /Android/i;
const MOBILE_REGEX = /Mobile/i;
const PHONE_USER_AGENT_REGEX = /iPhone|iPod|IEMobile|BlackBerry|Opera Mini/i;

// Android tablets omit "Mobile" from the user agent, and iPads are excluded
// by not matching iPad. Two linear searches replace /Android.*Mobile/, which
// backtracks polynomially on repeated "Android" input (CodeQL js/polynomial-redos).
const isAndroidPhoneUserAgent = (userAgent: string) => {
  const androidIndex = userAgent.search(ANDROID_REGEX);
  return (
    androidIndex !== -1 && MOBILE_REGEX.test(userAgent.slice(androidIndex))
  );
};

export const isPhoneUserAgent = (userAgent: string) =>
  PHONE_USER_AGENT_REGEX.test(userAgent) || isAndroidPhoneUserAgent(userAgent);
