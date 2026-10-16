const MOBILE_USER_AGENT_REGEX =
  /Android|iPhone|iPad|iPod|IEMobile|BlackBerry|Opera Mini/i;

export const isMobileUserAgent = (userAgent: string) =>
  MOBILE_USER_AGENT_REGEX.test(userAgent);
