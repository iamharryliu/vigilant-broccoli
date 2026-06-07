import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { exec } from 'child_process';
import { NextResponse } from 'next/server';
import { promisify } from 'util';

const execAsync = promisify(exec);

const TAILNET = 'echidna-rohu.ts.net';
const TAILSCALE_API_BASE = 'https://api.tailscale.com/api/v2';
const ONLINE_THRESHOLD_MS = 5 * 60 * 1000;
const NOT_AVAILABLE = 'N/A';
const ENV_KEY = 'TAILSCALE_API_KEY';
const ERR_NOT_CONFIGURED = `${ENV_KEY} not configured`;
const ERR_FETCH_FAILED = 'Failed to fetch Tailscale machines';
const TAILSCALE_IP_CMD = 'tailscale ip -4';

interface TailscaleDevice {
  id: string;
  name: string;
  hostname: string;
  addresses: string[];
  os: string;
  lastSeen: string;
  online?: boolean;
  authorized: boolean;
  clientVersion: string;
}

interface TailscaleMachine {
  id: string;
  name: string;
  hostname: string;
  address: string;
  os: string;
  lastSeen: string;
  online: boolean;
  authorized: boolean;
  clientVersion: string;
  isCurrent: boolean;
}

const isOnline = (lastSeen: string): boolean =>
  Date.now() - new Date(lastSeen).getTime() < ONLINE_THRESHOLD_MS;

const getLocalTailscaleIps = async (): Promise<string[]> => {
  try {
    const { stdout } = await execAsync(TAILSCALE_IP_CMD);
    return stdout
      .trim()
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
};

const toMachine = (
  d: TailscaleDevice,
  localIps: string[],
): TailscaleMachine => ({
  id: d.id,
  name: d.name.split('.')[0],
  hostname: d.hostname,
  address: d.addresses?.[0] ?? NOT_AVAILABLE,
  os: d.os,
  lastSeen: d.lastSeen,
  online: d.online ?? isOnline(d.lastSeen),
  authorized: d.authorized,
  clientVersion: d.clientVersion,
  isCurrent: (d.addresses ?? []).some(addr => localIps.includes(addr)),
});

export async function GET() {
  const apiKey = getEnvironmentVariable(ENV_KEY);

  if (!apiKey) {
    return NextResponse.json(
      { error: ERR_NOT_CONFIGURED },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }

  try {
    const response = await fetch(
      `${TAILSCALE_API_BASE}/tailnet/${TAILNET}/devices`,
      {
        headers: { Authorization: `Bearer ${apiKey}` },
        cache: 'no-store',
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: `Tailscale API error: ${response.status}` },
        { status: response.status },
      );
    }

    const [data, localIps] = await Promise.all([
      response.json() as Promise<{ devices: TailscaleDevice[] }>,
      getLocalTailscaleIps(),
    ]);
    const machines = (data.devices ?? [])
      .map(d => toMachine(d, localIps))
      .sort(
        (a, b) =>
          Number(b.isCurrent) - Number(a.isCurrent) ||
          Number(b.online) - Number(a.online) ||
          a.name.localeCompare(b.name),
      );

    return NextResponse.json({ machines });
  } catch (error) {
    console.error(ERR_FETCH_FAILED, error);
    return NextResponse.json(
      { error: ERR_FETCH_FAILED },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}
