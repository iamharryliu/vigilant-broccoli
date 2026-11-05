import { NextRequest, NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const execFileAsync = promisify(execFile);

const NMAP_BIN = 'nmap';
const NMAP_ARGS = [
  '-sT',
  '-Pn',
  '-T4',
  '--top-ports',
  '100',
  '--host-timeout',
  '30s',
  '--max-retries',
  '1',
];
const IPV4_REGEX = /^(\d{1,3}\.){3}\d{1,3}$/;
const NMAP_TIMEOUT_MS = 45000;
const PORT_LINE_REGEX = /^(\d+)\/tcp\s+(\S+)\s+(\S.*)?$/;
const UNKNOWN_SERVICE = 'unknown';
const ERR_INVALID_BODY = 'Invalid request body';
const ERR_INVALID_IP = 'Invalid IP address';
const ERR_SCAN_FAILED = 'Scan failed or timed out';
const ERR_NMAP_MISSING = 'nmap is not installed (try: brew install nmap)';

export interface ScannedPort {
  port: number;
  state: string;
  service: string;
}

const parseNmapOutput = (stdout: string): ScannedPort[] => {
  const ports: ScannedPort[] = [];
  for (const line of stdout.split('\n')) {
    const match = line.match(PORT_LINE_REGEX);
    if (!match) continue;
    ports.push({
      port: parseInt(match[1], 10),
      state: match[2],
      service: (match[3] ?? '').trim() || UNKNOWN_SERVICE,
    });
  }
  return ports;
};

const isValidIpv4 = (ip: string): boolean => {
  if (!IPV4_REGEX.test(ip)) return false;
  return ip.split('.').every(octet => {
    const n = parseInt(octet, 10);
    return n >= 0 && n <= 255;
  });
};

export async function POST(req: NextRequest) {
  let ip: string;
  try {
    const body = await req.json();
    ip = String(body.ip ?? '');
  } catch {
    return NextResponse.json(
      { error: ERR_INVALID_BODY },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  if (!isValidIpv4(ip)) {
    return NextResponse.json(
      { error: ERR_INVALID_IP },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  try {
    const { stdout } = await execFileAsync(NMAP_BIN, [...NMAP_ARGS, ip], {
      timeout: NMAP_TIMEOUT_MS,
    });
    return NextResponse.json({ ip, ports: parseNmapOutput(stdout) });
  } catch (err) {
    const message = err instanceof Error ? err.message : '';
    if (/not found|ENOENT/.test(message)) {
      return NextResponse.json(
        { error: ERR_NMAP_MISSING },
        { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
      );
    }
    return NextResponse.json(
      { error: ERR_SCAN_FAILED },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}
