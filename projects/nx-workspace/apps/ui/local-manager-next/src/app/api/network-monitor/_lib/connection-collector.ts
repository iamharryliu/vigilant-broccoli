import { execFile } from 'child_process';
import { promisify } from 'util';
import {
  CONNECTION_DIRECTION,
  CONNECTION_SCOPE,
} from '../../../constants/network-monitor';
import { pruneFlows, StoredFlow, upsertFlows } from './flow-store';
import { classifyIp, parseAddr } from './lsof';
import { ByteCounters, readSocketCounters, socketKey } from './nettop';

const execFileAsync = promisify(execFile);

// +c 0 keeps full process names; -sTCP filters only TCP, so UDP sockets come
// through unfiltered and unconnected ones are dropped while parsing.
const LSOF_ARGS = [
  '+c',
  '0',
  '-nP',
  '-iTCP',
  '-sTCP:ESTABLISHED,LISTEN',
  '-iUDP',
];
const LSOF_MAX_BUFFER = 16 * 1024 * 1024;
const LISTEN_STATE = '(LISTEN)';
const ADDR_SEPARATOR = '->';
// lsof takes ~50ms and nettop ~20ms; one-second samples catch most short-lived connections
// without measurable load.
const SAMPLE_INTERVAL_MS = 1000;
const PRUNE_INTERVAL_MS = 60 * 60 * 1000;

interface Socket {
  process: string;
  pid: number;
  protocol: string;
  localPort: number;
  remoteIp: string;
  remotePort: number;
}

export interface FlowRate {
  rateIn: number;
  rateOut: number;
}

interface CollectorState {
  timer: NodeJS.Timeout;
  sampling: boolean;
  lastPrunedAt: number;
  lastSampledAt: number | null;
  openSockets: Map<string, number>;
  flowRates: Map<string, FlowRate>;
  // null until the first sample, which only sets the baseline: counters for
  // sockets that predate the collector would otherwise count as one burst.
  prevCounters: Map<string, ByteCounters> | null;
  lastError: string | null;
}

// Instrumentation and each route are separate bundles; keeping the collector
// on globalThis ensures one sampling loop per server process.
const globalCollector = globalThis as typeof globalThis & {
  connectionCollector?: CollectorState;
};

const decodeLsofName = (name: string) =>
  name.replace(/\\x([0-9a-f]{2})/gi, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16)),
  );

const parseLsof = (stdout: string) => {
  const listenPorts = new Set<number>();
  const sockets: Socket[] = [];
  for (const line of stdout.trim().split('\n').slice(1)) {
    const parts = line.split(/\s+/);
    if (parts.length < 9) continue;
    const [command, pidField, , , , , , protocol, name, state] = parts;
    const pid = parseInt(pidField, 10);
    if (isNaN(pid)) continue;

    if (state === LISTEN_STATE) {
      const local = parseAddr(name);
      if (local) listenPorts.add(local.port);
      continue;
    }
    if (!name.includes(ADDR_SEPARATOR)) continue;
    const [localField, remoteField] = name.split(ADDR_SEPARATOR);
    const local = parseAddr(localField);
    const remote = parseAddr(remoteField);
    if (!local || !remote) continue;
    if (classifyIp(remote.ip) !== CONNECTION_SCOPE.EXTERNAL) continue;

    sockets.push({
      process: decodeLsofName(command),
      pid,
      protocol,
      localPort: local.port,
      remoteIp: remote.ip,
      remotePort: remote.port,
    });
  }
  return { listenPorts, sockets };
};

const byteDelta = (
  current: ByteCounters | undefined,
  previous: Map<string, ByteCounters> | null,
  key: string,
): ByteCounters => {
  if (!current || !previous) return { bytesIn: 0, bytesOut: 0 };
  const before = previous.get(key);
  // A socket new since the last sample, or a reused 5-tuple whose counters
  // restarted, carries only traffic from this interval.
  if (
    !before ||
    current.bytesIn < before.bytesIn ||
    current.bytesOut < before.bytesOut
  ) {
    return current;
  }
  return {
    bytesIn: current.bytesIn - before.bytesIn,
    bytesOut: current.bytesOut - before.bytesOut,
  };
};

// Inbound clients use ephemeral source ports, so they are keyed by our
// listening port instead to keep one flow per client and service. Flow byte
// counts are this interval's deltas; the store adds them to its totals.
const toFlows = (
  stdout: string,
  counters: Map<string, ByteCounters>,
  previous: Map<string, ByteCounters> | null,
  now: number,
) => {
  const { listenPorts, sockets } = parseLsof(stdout);
  const flows = new Map<string, StoredFlow>();
  const openSockets = new Map<string, number>();
  const seenSockets = new Set<string>();
  for (const socket of sockets) {
    const key = socketKey(
      socket.pid,
      socket.protocol,
      socket.localPort,
      socket.remoteIp,
      socket.remotePort,
    );
    // lsof lists a socket once per file descriptor sharing it.
    if (seenSockets.has(key)) continue;
    seenSockets.add(key);
    const inbound = listenPorts.has(socket.localPort);
    const direction = inbound
      ? CONNECTION_DIRECTION.INBOUND
      : CONNECTION_DIRECTION.OUTBOUND;
    const id = [
      socket.process,
      socket.protocol,
      direction,
      socket.remoteIp,
      inbound ? 0 : socket.remotePort,
      inbound ? socket.localPort : 0,
    ].join('|');
    const delta = byteDelta(counters.get(key), previous, key);
    const existing = flows.get(id);
    openSockets.set(id, (openSockets.get(id) ?? 0) + 1);
    flows.set(id, {
      id,
      ...socket,
      direction,
      firstSeen: now,
      lastSeen: now,
      bytesIn: (existing?.bytesIn ?? 0) + delta.bytesIn,
      bytesOut: (existing?.bytesOut ?? 0) + delta.bytesOut,
    });
  }
  return { flows: [...flows.values()], openSockets };
};

const toRates = (flows: StoredFlow[], elapsedMs: number | null) =>
  new Map<string, FlowRate>(
    flows.map(f => [
      f.id,
      elapsedMs
        ? {
            rateIn: (f.bytesIn * 1000) / elapsedMs,
            rateOut: (f.bytesOut * 1000) / elapsedMs,
          }
        : { rateIn: 0, rateOut: 0 },
    ]),
  );

const sample = async (state: CollectorState) => {
  if (state.sampling) return;
  state.sampling = true;
  try {
    const now = Date.now();
    const [{ stdout }, counters] = await Promise.all([
      execFileAsync('lsof', LSOF_ARGS, { maxBuffer: LSOF_MAX_BUFFER }).catch(
        err => ({ stdout: (err.stdout as string) ?? '' }),
      ),
      readSocketCounters(),
    ]);
    const { flows, openSockets } = toFlows(
      stdout,
      counters,
      state.prevCounters,
      now,
    );
    upsertFlows(flows);
    state.flowRates = toRates(
      flows,
      state.lastSampledAt === null ? null : now - state.lastSampledAt,
    );
    state.prevCounters = counters;
    if (now - state.lastPrunedAt > PRUNE_INTERVAL_MS) {
      pruneFlows(now);
      state.lastPrunedAt = now;
    }
    state.openSockets = openSockets;
    state.lastSampledAt = now;
    state.lastError = null;
  } catch (err) {
    state.lastError = err instanceof Error ? err.message : String(err);
  } finally {
    state.sampling = false;
  }
};

export const startConnectionCollector = (): CollectorState => {
  if (globalCollector.connectionCollector) {
    return globalCollector.connectionCollector;
  }
  const state: CollectorState = {
    timer: setInterval(() => sample(state), SAMPLE_INTERVAL_MS),
    sampling: false,
    lastPrunedAt: 0,
    lastSampledAt: null,
    openSockets: new Map(),
    flowRates: new Map(),
    prevCounters: null,
    lastError: null,
  };
  // Don't keep `next build` workers or scripts alive just for sampling.
  state.timer.unref();
  globalCollector.connectionCollector = state;
  void sample(state);
  return state;
};
