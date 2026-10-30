import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import {
  CONNECTION_MAP_WINDOW,
  CONNECTION_MAP_WINDOW_PARAM,
  ConnectionMapResponse,
  ConnectionMapWindow,
} from '../../../constants/network-monitor';
import { startConnectionCollector } from '../_lib/connection-collector';
import { listFlowsSince } from '../_lib/flow-store';
import { ensureGeoIp, lookupGeo } from '../_lib/geoip';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_FLOWS = 2000;
const PUBLIC_IP_URL = 'https://api.ipify.org?format=json';
const PUBLIC_IP_TTL_MS = 10 * 60 * 1000;
const FETCH_ERROR = 'Failed to read connections';

const isWindow = (value: string | null): value is ConnectionMapWindow =>
  value !== null && value in CONNECTION_MAP_WINDOW;

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

export async function GET(request: NextRequest) {
  try {
    const now = Date.now();
    // Already started by instrumentation; this only returns its state.
    const collector = startConnectionCollector();
    const geoStatus = ensureGeoIp();
    const windowParam = request.nextUrl.searchParams.get(
      CONNECTION_MAP_WINDOW_PARAM,
    );
    const windowMs = isWindow(windowParam)
      ? CONNECTION_MAP_WINDOW[windowParam]
      : CONNECTION_MAP_WINDOW['15m'];

    const ip = await getPublicIp(now);
    const homeLocation = ip ? lookupGeo(ip) : null;
    const body: ConnectionMapResponse = {
      home: ip && homeLocation ? { ip, ...homeLocation } : null,
      geoStatus,
      sampledAt: collector.lastSampledAt ?? now,
      collectorError: collector.lastError,
      flows: listFlowsSince(now - windowMs, MAX_FLOWS).map(flow => ({
        ...flow,
        sockets: collector.openSockets.get(flow.id) ?? 0,
        location: lookupGeo(flow.remoteIp),
      })),
    };
    return NextResponse.json(body);
  } catch {
    return NextResponse.json(
      { error: FETCH_ERROR },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}
