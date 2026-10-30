import { NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import {
  CONNECTION_DIRECTION,
  CONNECTION_SCOPE,
  ConnectionFlow,
  ConnectionMapResponse,
} from '../../../constants/network-monitor';
import { classifyIp, parseAddr } from '../_lib/lsof';
import { ensureGeoIp, lookupGeo } from '../_lib/geoip';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
const FLOW_RETENTION_MS = 15 * 60 * 1000;
const PUBLIC_IP_URL = 'https://api.ipify.org?format=json';
const PUBLIC_IP_TTL_MS = 10 * 60 * 1000;
const FETCH_ERROR = 'Failed to sample connections';

interface Socket {
  process: string;
  pid: number;
  protocol: string;
  localPort: number;
  remoteIp: string;
  remotePort: number;
}

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

// Flows persist across polls so short-lived connections stay on the map for
// the retention window instead of flickering out between samples.
const flows = new Map<string, Omit<ConnectionFlow, 'location'>>();

const recordSample = (stdout: string, now: number) => {
  const { listenPorts, sockets } = parseLsof(stdout);
  const socketCounts = new Map<string, number>();

  for (const socket of sockets) {
    const direction = listenPorts.has(socket.localPort)
      ? CONNECTION_DIRECTION.INBOUND
      : CONNECTION_DIRECTION.OUTBOUND;
    // Inbound clients use ephemeral source ports, so key them by our listening
    // port instead to keep one flow per client and service.
    const remotePort =
      direction === CONNECTION_DIRECTION.INBOUND ? 0 : socket.remotePort;
    const id = [
      socket.process,
      socket.protocol,
      direction,
      socket.remoteIp,
      remotePort,
      direction === CONNECTION_DIRECTION.INBOUND ? socket.localPort : 0,
    ].join('|');

    socketCounts.set(id, (socketCounts.get(id) ?? 0) + 1);
    const existing = flows.get(id);
    flows.set(id, {
      id,
      process: socket.process,
      pid: socket.pid,
      protocol: socket.protocol,
      direction,
      localPort: socket.localPort,
      remoteIp: socket.remoteIp,
      remotePort: socket.remotePort,
      sockets: 0,
      firstSeen: existing?.firstSeen ?? now,
      lastSeen: now,
    });
  }

  for (const [id, flow] of flows) {
    if (now - flow.lastSeen > FLOW_RETENTION_MS) flows.delete(id);
    else flow.sockets = socketCounts.get(id) ?? 0;
  }
};

let publicIp: { ip: string; fetchedAt: number } | null = null;

const getPublicIp = async (now: number): Promise<string | null> => {
  if (publicIp && now - publicIp.fetchedAt < PUBLIC_IP_TTL_MS) {
    return publicIp.ip;
  }
  const res = await fetch(PUBLIC_IP_URL).catch(() => null);
  if (!res?.ok) return publicIp?.ip ?? null;
  const { ip } = (await res.json()) as { ip: string };
  publicIp = { ip, fetchedAt: now };
  return ip;
};

export async function GET() {
  try {
    const now = Date.now();
    const geoStatus = ensureGeoIp();
    const [{ stdout }, ip] = await Promise.all([
      execFileAsync('lsof', LSOF_ARGS, { maxBuffer: LSOF_MAX_BUFFER }).catch(
        err => ({ stdout: (err.stdout as string) ?? '' }),
      ),
      getPublicIp(now),
    ]);
    recordSample(stdout, now);

    const homeLocation = ip ? lookupGeo(ip) : null;
    const body: ConnectionMapResponse = {
      home: ip && homeLocation ? { ip, ...homeLocation } : null,
      geoStatus,
      sampledAt: now,
      flows: [...flows.values()]
        .sort((a, b) => b.lastSeen - a.lastSeen)
        .map(flow => ({ ...flow, location: lookupGeo(flow.remoteIp) })),
    };
    return NextResponse.json(body);
  } catch {
    return NextResponse.json(
      { error: FETCH_ERROR },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}
