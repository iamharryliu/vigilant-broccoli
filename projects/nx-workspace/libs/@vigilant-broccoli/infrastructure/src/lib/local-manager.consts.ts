import * as LOCAL_MANAGER from './local-manager-origins.json';

// JSON so weather-next's next.config.js can require the same origins for its
// frame-ancestors header without a TS loader.
export const LOCAL_MANAGER_URL = LOCAL_MANAGER.url;
// The proxied host, the PM2 bind (1337) and `next dev` (3000) on loopback.
export const LOCAL_MANAGER_ORIGINS: readonly string[] = [
  LOCAL_MANAGER.url,
  ...LOCAL_MANAGER.loopbackOrigins,
];
