import { createWriteStream, existsSync, promises as fs } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import { createGunzip } from 'zlib';
import {
  GEO_STATUS,
  GeoStatus,
  MapLocation,
} from '../../../constants/network-monitor';
import { MmdbReader, openMmdb } from './mmdb';

const CACHE_DIR = join(homedir(), '.cache', 'vigilant-broccoli');
const DB_PATH = join(CACHE_DIR, 'dbip-city-lite.mmdb');
const DB_URL_PREFIX = 'https://download.db-ip.com/free/dbip-city-lite-';
const DB_URL_SUFFIX = '.mmdb.gz';
const DB_MAX_AGE_MS = 35 * 24 * 60 * 60 * 1000;
const MONTH_FALLBACKS = 2;

// DB-IP publishes one file per month and the current month's can lag behind
// the calendar, so fall back to earlier months on 404.
const candidateUrls = (now = new Date()): string[] =>
  Array.from({ length: MONTH_FALLBACKS }, (_, i) => {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i));
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    return `${DB_URL_PREFIX}${d.getUTCFullYear()}-${month}${DB_URL_SUFFIX}`;
  });

const download = async (): Promise<void> => {
  await fs.mkdir(CACHE_DIR, { recursive: true });
  const tmpPath = `${DB_PATH}.download`;
  for (const url of candidateUrls()) {
    const res = await fetch(url);
    if (!res.ok || !res.body) continue;
    await pipeline(
      Readable.fromWeb(res.body as Parameters<typeof Readable.fromWeb>[0]),
      createGunzip(),
      createWriteStream(tmpPath),
    );
    await fs.rename(tmpPath, DB_PATH);
    return;
  }
  throw new Error('No DB-IP Lite City database available to download');
};

const isStale = async (): Promise<boolean> => {
  if (!existsSync(DB_PATH)) return true;
  const { mtimeMs } = await fs.stat(DB_PATH);
  return Date.now() - mtimeMs > DB_MAX_AGE_MS;
};

let reader: MmdbReader | null = null;
let status: GeoStatus = GEO_STATUS.LOADING;
let loadPromise: Promise<void> | null = null;

const load = async () => {
  if (await isStale()) {
    // Keep using an existing stale file if the refresh fails.
    await download().catch(err => {
      if (!existsSync(DB_PATH)) throw err;
    });
  }
  reader = openMmdb(await fs.readFile(DB_PATH));
  status = GEO_STATUS.READY;
};

// Starts loading in the background; callers get null lookups until ready so
// the first poll is not blocked on a ~60MB download.
export const ensureGeoIp = (): GeoStatus => {
  if (!loadPromise) {
    loadPromise = load().catch(() => {
      status = GEO_STATUS.ERROR;
      loadPromise = null;
    });
  }
  return status;
};

type NamedRecord = { names?: { en?: string }; iso_code?: string };

export const lookupGeo = (ip: string): MapLocation | null => {
  if (!reader) return null;
  const record = reader.get(ip);
  const location = record?.location as
    { latitude?: number; longitude?: number } | undefined;
  if (location?.latitude === undefined || location.longitude === undefined) {
    return null;
  }
  const city = record?.city as NamedRecord | undefined;
  const country = record?.country as NamedRecord | undefined;
  return {
    lat: location.latitude,
    lng: location.longitude,
    city: city?.names?.en ?? null,
    country: country?.names?.en ?? null,
    countryCode: country?.iso_code ?? null,
  };
};
