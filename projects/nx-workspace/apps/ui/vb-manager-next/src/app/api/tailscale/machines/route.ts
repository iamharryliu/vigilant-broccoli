import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';
import { NextResponse } from 'next/server';

const TAILNET = 'echidna-rohu.ts.net';
const TAILSCALE_API_BASE = 'https://api.tailscale.com/api/v2';
const ONLINE_THRESHOLD_MS = 5 * 60 * 1000;
const NOT_AVAILABLE = 'N/A';
const ENV_KEY = 'TAILSCALE_API_KEY';
const ERR_NOT_CONFIGURED = `${ENV_KEY} not configured`;
const ERR_FETCH_FAILED = 'Failed to fetch Tailscale machines';

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
}

const isOnline = (lastSeen: string): boolean =>
  Date.now() - new Date(lastSeen).getTime() < ONLINE_THRESHOLD_MS;

const toMachine = (d: TailscaleDevice): TailscaleMachine => ({
  id: d.id,
  name: d.name.split('.')[0],
  hostname: d.hostname,
  address: d.addresses?.[0] ?? NOT_AVAILABLE,
  os: d.os,
  lastSeen: d.lastSeen,
  online: d.online ?? isOnline(d.lastSeen),
  authorized: d.authorized,
  clientVersion: d.clientVersion,
});

export async function GET() {
  const apiKey = getEnvironmentVariable(ENV_KEY);

  if (!apiKey) {
    return NextResponse.json({ error: ERR_NOT_CONFIGURED }, { status: 500 });
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

    const data = (await response.json()) as { devices: TailscaleDevice[] };
    const machines = (data.devices ?? [])
      .map(toMachine)
      .sort(
        (a, b) =>
          Number(b.online) - Number(a.online) || a.name.localeCompare(b.name),
      );

    return NextResponse.json({ machines });
  } catch (error) {
    console.error(ERR_FETCH_FAILED, error);
    return NextResponse.json({ error: ERR_FETCH_FAILED }, { status: 500 });
  }
}
