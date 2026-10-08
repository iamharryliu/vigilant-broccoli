export const DEVICE_TYPE = {
  ROUTER: 'Router / Gateway',
  PRIVACY_MAC: 'Privacy MAC',
  UNKNOWN: 'Unknown',
} as const;

export const CONNECTION_SCOPE = {
  LOOPBACK: 'loopback',
  PRIVATE: 'private',
  EXTERNAL: 'external',
} as const;

export type ConnectionScope =
  (typeof CONNECTION_SCOPE)[keyof typeof CONNECTION_SCOPE];
