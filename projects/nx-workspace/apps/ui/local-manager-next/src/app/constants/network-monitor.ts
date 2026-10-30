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
  location: MapLocation | null;
}

export interface ConnectionMapResponse {
  home: (MapLocation & { ip: string }) | null;
  geoStatus: GeoStatus;
  sampledAt: number;
  flows: ConnectionFlow[];
}
