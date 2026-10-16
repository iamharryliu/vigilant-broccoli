export const CONNECTION_STATUS = {
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  ERROR: 'error',
} as const;

export type ConnectionStatus =
  (typeof CONNECTION_STATUS)[keyof typeof CONNECTION_STATUS];

export interface LiveUser {
  userId: string;
  username: string;
  lat: number | null;
  lng: number | null;
  updatedAt: number;
}

export type SharingUser = LiveUser & { lat: number; lng: number };

export const isSharingUser = (u: LiveUser): u is SharingUser =>
  u.lat !== null && u.lng !== null;

export interface LiveLocationsState {
  users: LiveUser[];
  connectionStatus: ConnectionStatus;
}
