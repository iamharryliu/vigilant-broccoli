import type { AppEntry } from '../constants/apps';

const PLATFORM = {
  IOS: 'ios',
  ANDROID: 'android',
  DESKTOP: 'desktop',
} as const;

type Platform = (typeof PLATFORM)[keyof typeof PLATFORM];

const IOS_FALLBACK_DELAY_MS = 1200;

const detectPlatform = (): Platform => {
  const { userAgent, maxTouchPoints } = navigator;
  if (/iPhone|iPad|iPod/.test(userAgent)) return PLATFORM.IOS;
  // iPadOS reports as a Mac, distinguishable only by touch support.
  if (/Macintosh/.test(userAgent) && maxTouchPoints > 1) return PLATFORM.IOS;
  if (/Android/.test(userAgent)) return PLATFORM.ANDROID;
  return PLATFORM.DESKTOP;
};

const openWeb = (webUrl: string) => window.open(webUrl, '_blank', 'noopener');

const openIos = (iosUrl: string, webUrl: string) => {
  // A successful app switch hides the page; only fall back if it stays visible.
  const cancel = () => {
    window.clearTimeout(timer);
    document.removeEventListener('visibilitychange', cancel);
    window.removeEventListener('pagehide', cancel);
  };
  const timer = window.setTimeout(() => {
    cancel();
    if (document.visibilityState === 'visible') window.location.href = webUrl;
  }, IOS_FALLBACK_DELAY_MS);
  document.addEventListener('visibilitychange', cancel);
  window.addEventListener('pagehide', cancel);
  window.location.href = iosUrl;
};

const buildAndroidIntent = (webUrl: string, androidPackage: string) => {
  const { host, pathname, search } = new URL(webUrl);
  const path = pathname === '/' ? '' : pathname;
  return `intent://${host}${path}${search}#Intent;scheme=https;package=${androidPackage};S.browser_fallback_url=${encodeURIComponent(webUrl)};end`;
};

export const openApp = ({ webUrl, iosUrl, androidPackage }: AppEntry) => {
  const platform = detectPlatform();
  if (platform === PLATFORM.IOS && iosUrl) return openIos(iosUrl, webUrl);
  if (platform === PLATFORM.ANDROID && androidPackage) {
    window.location.href = buildAndroidIntent(webUrl, androidPackage);
    return;
  }
  openWeb(webUrl);
};
