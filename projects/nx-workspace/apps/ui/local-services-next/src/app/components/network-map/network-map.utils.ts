import {
  CONNECTION_DIRECTION,
  ConnectionDirection,
  ConnectionFlow,
  MapLocation,
} from '../../constants/network-monitor';

const ARC_SEGMENTS = 64;
const COORD_PRECISION = 2;
const DEG = Math.PI / 180;

export type LatLng = [number, number];

export interface Destination {
  key: string;
  location: MapLocation;
  flows: ConnectionFlow[];
  directions: Set<ConnectionDirection>;
  lastSeen: number;
  activeSockets: number;
  totalBytes: number;
}

export interface Movement {
  direction: ConnectionDirection;
  rate: number;
}

const BYTE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'];
const BYTE_STEP = 1024;
// Upper bounds in bytes/s for each animation speed tier; anything faster
// lands in the last tier.
const SPEED_TIER_BOUNDS = [1024, 10 * 1024, 100 * 1024, 1024 * 1024];

const toVector = ([lat, lng]: LatLng) => [
  Math.cos(lat * DEG) * Math.cos(lng * DEG),
  Math.cos(lat * DEG) * Math.sin(lng * DEG),
  Math.sin(lat * DEG),
];

// Spherical interpolation gives the great-circle path; longitudes are then
// unwrapped so Leaflet doesn't draw a line back across the whole map when the
// arc crosses the antimeridian.
export const greatCircleArc = (from: LatLng, to: LatLng): LatLng[] => {
  const a = toVector(from);
  const b = toVector(to);
  const dot = Math.min(
    1,
    Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]),
  );
  const omega = Math.acos(dot);
  if (omega < 1e-6) return [from, to];

  const points: LatLng[] = [];
  let prevLng = from[1];
  for (let i = 0; i <= ARC_SEGMENTS; i++) {
    const t = i / ARC_SEGMENTS;
    const s1 = Math.sin((1 - t) * omega) / Math.sin(omega);
    const s2 = Math.sin(t * omega) / Math.sin(omega);
    const [x, y, z] = [0, 1, 2].map(k => s1 * a[k] + s2 * b[k]);
    const lat = Math.atan2(z, Math.hypot(x, y)) / DEG;
    let lng = Math.atan2(y, x) / DEG;
    while (lng - prevLng > 180) lng -= 360;
    while (lng - prevLng < -180) lng += 360;
    prevLng = lng;
    points.push([lat, lng]);
  }
  return points;
};

export const groupByDestination = (flows: ConnectionFlow[]): Destination[] => {
  const groups = new Map<string, Destination>();
  for (const flow of flows) {
    if (!flow.location) continue;
    const key = `${flow.location.lat.toFixed(COORD_PRECISION)},${flow.location.lng.toFixed(COORD_PRECISION)}`;
    const group = groups.get(key) ?? {
      key,
      location: flow.location,
      flows: [],
      directions: new Set<ConnectionDirection>(),
      lastSeen: 0,
      activeSockets: 0,
      totalBytes: 0,
    };
    group.flows.push(flow);
    group.directions.add(flow.direction);
    group.lastSeen = Math.max(group.lastSeen, flow.lastSeen);
    group.activeSockets += flow.sockets;
    group.totalBytes += flow.bytesIn + flow.bytesOut;
    groups.set(key, group);
  }
  return [...groups.values()];
};

export const dominantDirection = (d: Destination): ConnectionDirection =>
  d.directions.has(CONNECTION_DIRECTION.INBOUND)
    ? CONNECTION_DIRECTION.INBOUND
    : CONNECTION_DIRECTION.OUTBOUND;

// Dashes follow the bytes: uploads move out from this machine and downloads
// move home. An open connection with no traffic this sample still trickles in
// the direction it was opened, so open connections stay visibly alive.
export const activeMovements = (d: Destination): Movement[] => {
  const open = d.flows.filter(f => f.sockets > 0);
  if (!open.length) return [];
  const rateOut = open.reduce((sum, f) => sum + f.rateOut, 0);
  const rateIn = open.reduce((sum, f) => sum + f.rateIn, 0);
  const movements: Movement[] = [];
  if (rateOut > 0) {
    movements.push({ direction: CONNECTION_DIRECTION.OUTBOUND, rate: rateOut });
  }
  if (rateIn > 0) {
    movements.push({ direction: CONNECTION_DIRECTION.INBOUND, rate: rateIn });
  }
  if (movements.length) return movements;
  return [...new Set(open.map(f => f.direction))].map(direction => ({
    direction,
    rate: 0,
  }));
};

export const speedTier = (rate: number): number => {
  const tier = SPEED_TIER_BOUNDS.findIndex(bound => rate < bound);
  return tier === -1 ? SPEED_TIER_BOUNDS.length : tier;
};

export const SPEED_TIER_COUNT = SPEED_TIER_BOUNDS.length + 1;

export const formatBytes = (bytes: number): string => {
  let value = bytes;
  let unit = 0;
  while (value >= BYTE_STEP && unit < BYTE_UNITS.length - 1) {
    value /= BYTE_STEP;
    unit++;
  }
  return `${unit === 0 ? value : value.toFixed(1)} ${BYTE_UNITS[unit]}`;
};

export const formatRate = (rate: number): string =>
  `${formatBytes(Math.round(rate))}/s`;

export const formatPlace = (location: MapLocation | null): string => {
  if (!location) return '—';
  return [location.city, location.countryCode ?? location.country]
    .filter(Boolean)
    .join(', ');
};

export const formatAge = (ms: number): string => {
  const seconds = Math.max(0, Math.round(ms / 1000));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.round(hours / 24)}d`;
};
