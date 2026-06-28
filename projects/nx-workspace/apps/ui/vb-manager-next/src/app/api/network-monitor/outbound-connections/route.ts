import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import {
  CONNECTION_SCOPE,
  ConnectionScope,
} from '../../../constants/network-monitor';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const execAsync = promisify(exec);

const LSOF_CMD = 'lsof -iTCP -sTCP:ESTABLISHED -n -P';
const ADDR_REGEX = /^(.+)->(.+)$/;
const IP_PORT_REGEX = /^(.+):(\d+)$/;
const FETCH_ERROR = 'Failed to fetch outbound connections';

export interface OutboundConnection {
  pid: number;
  name: string;
  localIp: string;
  localPort: number;
  remoteIp: string;
  remotePort: number;
  scope: ConnectionScope;
}

const classifyIp = (ip: string): ConnectionScope => {
  if (ip.startsWith('127.') || ip === '::1') return CONNECTION_SCOPE.LOOPBACK;
  if (ip.startsWith('10.')) return CONNECTION_SCOPE.PRIVATE;
  if (ip.startsWith('192.168.')) return CONNECTION_SCOPE.PRIVATE;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(ip)) return CONNECTION_SCOPE.PRIVATE;
  if (ip.startsWith('169.254.')) return CONNECTION_SCOPE.PRIVATE;
  if (ip.startsWith('fe80:')) return CONNECTION_SCOPE.PRIVATE;
  return CONNECTION_SCOPE.EXTERNAL;
};

const parseAddr = (addr: string): { ip: string; port: number } | null => {
  if (addr.startsWith('[')) {
    const end = addr.indexOf(']');
    if (end < 0) return null;
    const ip = addr.slice(1, end);
    const port = parseInt(addr.slice(end + 2), 10);
    return isNaN(port) ? null : { ip, port };
  }
  const m = addr.match(IP_PORT_REGEX);
  if (!m) return null;
  const port = parseInt(m[2], 10);
  return isNaN(port) ? null : { ip: m[1], port };
};

export async function GET() {
  try {
    const { stdout } = await execAsync(LSOF_CMD).catch(err => ({
      stdout: (err.stdout as string) ?? '',
    }));

    const connections: OutboundConnection[] = [];
    const seen = new Set<string>();
    const lines = stdout.trim().split('\n').slice(1);

    for (const line of lines) {
      const parts = line.split(/\s+/);
      if (parts.length < 9) continue;

      const name = parts[0];
      const pid = parseInt(parts[1], 10);
      const addrField = parts[8];

      const addrMatch = addrField.match(ADDR_REGEX);
      if (!addrMatch) continue;

      const local = parseAddr(addrMatch[1]);
      const remote = parseAddr(addrMatch[2]);
      if (!local || !remote || isNaN(pid)) continue;

      const key = `${pid}-${local.port}-${remote.ip}:${remote.port}`;
      if (seen.has(key)) continue;
      seen.add(key);

      connections.push({
        pid,
        name,
        localIp: local.ip,
        localPort: local.port,
        remoteIp: remote.ip,
        remotePort: remote.port,
        scope: classifyIp(remote.ip),
      });
    }

    const scopeOrder: Record<ConnectionScope, number> = {
      [CONNECTION_SCOPE.EXTERNAL]: 0,
      [CONNECTION_SCOPE.PRIVATE]: 1,
      [CONNECTION_SCOPE.LOOPBACK]: 2,
    };
    connections.sort((a, b) => {
      const s = scopeOrder[a.scope] - scopeOrder[b.scope];
      if (s !== 0) return s;
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json(connections);
  } catch {
    return NextResponse.json(
      { error: FETCH_ERROR },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}
