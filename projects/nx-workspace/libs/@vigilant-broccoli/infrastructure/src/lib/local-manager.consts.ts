import * as LOCAL_MANAGER from './local-manager-origins.json';
import * as MOBILE_MANAGER from './mobile-manager-origins.json';

// JSON so weather-next's next.config.js can require the same origins for its
// frame-ancestors header without a TS loader.
export const LOCAL_MANAGER_URL = LOCAL_MANAGER.url;
// The proxied host, the PM2 bind (1337) and `next dev` (3000) on loopback.
// mobile-manager-next's own `next dev` port is the same 3000.
export const WEATHER_EMBED_PARENT_ORIGINS: readonly string[] = [
  LOCAL_MANAGER.url,
  ...LOCAL_MANAGER.loopbackOrigins,
  ...MOBILE_MANAGER.origins,
];
