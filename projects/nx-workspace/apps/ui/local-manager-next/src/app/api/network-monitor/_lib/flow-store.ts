import { mkdirSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { DatabaseSync } from 'node:sqlite';
import {
  ConnectionDirection,
  ConnectionFlow,
} from '../../../constants/network-monitor';

const DB_DIR = join(homedir(), '.local', 'share', 'vigilant-broccoli');
const DB_PATH = join(DB_DIR, 'network-flows.sqlite');
const FLOWS_TABLE = 'network_flows';
const RETENTION_MS = 7 * 24 * 60 * 60 * 1000;

export type StoredFlow = Omit<
  ConnectionFlow,
  'location' | 'sockets' | 'rateIn' | 'rateOut'
>;

interface FlowRow {
  id: string;
  process: string;
  pid: number;
  protocol: string;
  direction: ConnectionDirection;
  local_port: number;
  remote_ip: string;
  remote_port: number;
  first_seen: number;
  last_seen: number;
  bytes_in: number;
  bytes_out: number;
}

const BYTE_COLUMNS = ['bytes_in', 'bytes_out'];

// Next bundles instrumentation and each route separately, so a module-level
// handle would open one connection per bundle.
const globalStore = globalThis as typeof globalThis & {
  networkFlowsDb?: DatabaseSync;
};

const openDb = () => {
  mkdirSync(DB_DIR, { recursive: true });
  const db = new DatabaseSync(DB_PATH);
  db.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS ${FLOWS_TABLE} (
      id TEXT PRIMARY KEY,
      process TEXT NOT NULL,
      pid INTEGER NOT NULL,
      protocol TEXT NOT NULL,
      direction TEXT NOT NULL,
      local_port INTEGER NOT NULL,
      remote_ip TEXT NOT NULL,
      remote_port INTEGER NOT NULL,
      first_seen INTEGER NOT NULL,
      last_seen INTEGER NOT NULL,
      bytes_in INTEGER NOT NULL DEFAULT 0,
      bytes_out INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS ${FLOWS_TABLE}_last_seen
      ON ${FLOWS_TABLE} (last_seen);
  `);
  // Databases created before byte counting existed lack these columns.
  const columns = new Set(
    (
      db.prepare(`PRAGMA table_info(${FLOWS_TABLE})`).all() as unknown as {
        name: string;
      }[]
    ).map(c => c.name),
  );
  for (const column of BYTE_COLUMNS) {
    if (!columns.has(column)) {
      db.exec(
        `ALTER TABLE ${FLOWS_TABLE} ADD COLUMN ${column} INTEGER NOT NULL DEFAULT 0`,
      );
    }
  }
  return db;
};

const getDb = () => (globalStore.networkFlowsDb ??= openDb());

// bytesIn/bytesOut are the sample's deltas, added to the stored totals.
export const upsertFlows = (flows: StoredFlow[]) => {
  if (!flows.length) return;
  const db = getDb();
  const upsert = db.prepare(`
    INSERT INTO ${FLOWS_TABLE} (
      id, process, pid, protocol, direction, local_port, remote_ip,
      remote_port, first_seen, last_seen, bytes_in, bytes_out
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      pid = excluded.pid,
      local_port = excluded.local_port,
      remote_port = excluded.remote_port,
      last_seen = excluded.last_seen,
      bytes_in = bytes_in + excluded.bytes_in,
      bytes_out = bytes_out + excluded.bytes_out
  `);
  db.exec('BEGIN');
  try {
    for (const f of flows) {
      upsert.run(
        f.id,
        f.process,
        f.pid,
        f.protocol,
        f.direction,
        f.localPort,
        f.remoteIp,
        f.remotePort,
        f.firstSeen,
        f.lastSeen,
        f.bytesIn,
        f.bytesOut,
      );
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
};

export const pruneFlows = (now: number) =>
  getDb()
    .prepare(`DELETE FROM ${FLOWS_TABLE} WHERE last_seen < ?`)
    .run(now - RETENTION_MS);

export const listFlowsSince = (since: number, limit: number): StoredFlow[] =>
  (
    getDb()
      .prepare(
        `SELECT * FROM ${FLOWS_TABLE} WHERE last_seen >= ? ORDER BY last_seen DESC LIMIT ?`,
      )
      .all(since, limit) as unknown as FlowRow[]
  ).map(row => ({
    id: row.id,
    process: row.process,
    pid: row.pid,
    protocol: row.protocol,
    direction: row.direction,
    localPort: row.local_port,
    remoteIp: row.remote_ip,
    remotePort: row.remote_port,
    firstSeen: row.first_seen,
    lastSeen: row.last_seen,
    bytesIn: row.bytes_in,
    bytesOut: row.bytes_out,
  }));
