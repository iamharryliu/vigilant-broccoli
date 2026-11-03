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

export const CONNECTION_DIRECTION = {
  INBOUND: 'inbound',
  OUTBOUND: 'outbound',
} as const;

export type ConnectionDirection =
  (typeof CONNECTION_DIRECTION)[keyof typeof CONNECTION_DIRECTION];

export const GEO_STATUS = {
  LOADING: 'loading',
  READY: 'ready',
  ERROR: 'error',
} as const;

export type GeoStatus = (typeof GEO_STATUS)[keyof typeof GEO_STATUS];

const MINUTE_MS = 60 * 1000;

export const CONNECTION_MAP_WINDOW = {
  '15m': 15 * MINUTE_MS,
  '1h': 60 * MINUTE_MS,
  '24h': 24 * 60 * MINUTE_MS,
  '7d': 7 * 24 * 60 * MINUTE_MS,
} as const;

export type ConnectionMapWindow = keyof typeof CONNECTION_MAP_WINDOW;

export const CONNECTION_MAP_WINDOW_PARAM = 'window';

export interface MapLocation {
  lat: number;
  lng: number;
  city: string | null;
  country: string | null;
  countryCode: string | null;
}

export interface ConnectionFlow {
  id: string;
  process: string;
  pid: number;
  protocol: string;
  direction: ConnectionDirection;
  localPort: number;
  remoteIp: string;
  remotePort: number;
  sockets: number;
  firstSeen: number;
  lastSeen: number;
  bytesIn: number;
  bytesOut: number;
  rateIn: number;
  rateOut: number;
  location: MapLocation | null;
}

export interface ConnectionMapResponse {
  home: (MapLocation & { ip: string }) | null;
  geoStatus: GeoStatus;
  sampledAt: number;
  collectorError: string | null;
  flows: ConnectionFlow[];
}
