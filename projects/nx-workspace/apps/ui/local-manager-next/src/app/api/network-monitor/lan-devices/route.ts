import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { isLocallyAdministered, lookupVendor } from '../_lib/oui';
import { getDefaultGateways, resolveHostnames } from '../_lib/network';
import { inferDeviceType } from '../_lib/device-type';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const execAsync = promisify(exec);

const ARP_CMD = 'arp -a';
const INCOMPLETE = '(incomplete)';
const BROADCAST_MAC = 'ff:ff:ff:ff:ff:ff';
const MULTICAST_PREFIX = '1:0:5e';
const ARP_LINE_REGEX = /^(.+?)\s+\(([\d.]+)\)\s+at\s+(\S+)\s+on\s+(\S+)/;

export interface LanDevice {
  ip: string;
  mac: string;
  hostname: string | null;
  iface: string;
  vendor: string | null;
  deviceType: string;
  isGateway: boolean;
  isPrivacyMac: boolean;
}

interface RawEntry {
  ip: string;
  mac: string;
  hostname: string | null;
  iface: string;
}

const parseArp = (stdout: string): RawEntry[] => {
  const entries: RawEntry[] = [];
  const seen = new Set<string>();
  for (const line of stdout.split('\n')) {
    const match = line.match(ARP_LINE_REGEX);
    if (!match) continue;
    const [, hostnamePart, ip, mac, iface] = match;
    if (mac === INCOMPLETE) continue;
    if (mac === BROADCAST_MAC) continue;
    if (mac.startsWith(MULTICAST_PREFIX)) continue;
    const key = `${ip}-${mac}`;
    if (seen.has(key)) continue;
    seen.add(key);
    entries.push({
      ip,
      mac,
      hostname: hostnamePart === '?' ? null : hostnamePart,
      iface,
    });
  }
  return entries;
};

const sortByIp = (a: { ip: string }, b: { ip: string }) => {
  const aOct = a.ip.split('.').map(Number);
  const bOct = b.ip.split('.').map(Number);
  for (let i = 0; i < 4; i++) {
    if (aOct[i] !== bOct[i]) return aOct[i] - bOct[i];
  }
  return 0;
};

export async function GET() {
  try {
    const { stdout } = await execAsync(ARP_CMD).catch(err => ({
      stdout: (err.stdout as string) ?? '',
    }));

    const raw = parseArp(stdout);

    const [gateways, hostnameMap, vendors] = await Promise.all([
      getDefaultGateways(),
      resolveHostnames(raw.filter(e => !e.hostname).map(e => e.ip)),
      Promise.all(raw.map(e => lookupVendor(e.mac))),
    ]);

    const devices: LanDevice[] = raw.map((entry, i) => {
      const hostname = entry.hostname ?? hostnameMap.get(entry.ip) ?? null;
      const vendor = vendors[i];
      const isGateway = gateways.has(entry.ip);
      const privacyMac = isLocallyAdministered(entry.mac);
      return {
        ip: entry.ip,
        mac: entry.mac,
        hostname,
        iface: entry.iface,
        vendor,
        isGateway,
        isPrivacyMac: privacyMac,
        deviceType: inferDeviceType({
          vendor,
          hostname,
          isGateway,
          isLocallyAdministered: privacyMac,
        }),
      };
    });

    devices.sort(sortByIp);
    return NextResponse.json(devices);
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch LAN devices' },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}
