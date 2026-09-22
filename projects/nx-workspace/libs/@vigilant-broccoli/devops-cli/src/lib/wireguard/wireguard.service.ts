import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { runCli } from '../cli/cli.utils';

export const WIREGUARD_CONNECTION_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const;

export type WireguardConnectionStatus =
  (typeof WIREGUARD_CONNECTION_STATUS)[keyof typeof WIREGUARD_CONNECTION_STATUS];

export interface WireguardConnection {
  name: string;
  interface: string;
  address: string;
  status: WireguardConnectionStatus;
}

interface NetworkInterface {
  name: string;
  flags: string[];
  addresses: string[];
}

const IFCONFIG_CLI = 'ifconfig';
const WIREGUARD_CONFIG_DIR = '/opt/homebrew/etc/wireguard';
const CONFIG_EXTENSION = '.conf';
// wireguard-go tunnels surface as utun interfaces on macOS.
const TUNNEL_INTERFACE_PREFIX = 'utun';
const INTERFACE_HEADER_PATTERN = /^(\S+):\s+flags=\S*<([^>]*)>/;
const INTERFACE_ADDRESS_PATTERN = /^\s+inet (\d+\.\d+\.\d+\.\d+)/;
const CONFIG_ADDRESS_PATTERN = /^Address\s*=\s*(.+)/m;
const CIDR_SEPARATOR = '/';
const FLAG_SEPARATOR = ',';
const INTERFACE_FLAG = {
  UP: 'UP',
  RUNNING: 'RUNNING',
} as const;
const NOT_AVAILABLE = 'N/A';

const parseInterfaces = (ifconfigOutput: string): NetworkInterface[] => {
  const interfaces: NetworkInterface[] = [];

  for (const line of ifconfigOutput.split('\n')) {
    const header = line.match(INTERFACE_HEADER_PATTERN);
    if (header) {
      interfaces.push({
        name: header[1],
        flags: header[2].split(FLAG_SEPARATOR),
        addresses: [],
      });
      continue;
    }

    const address = line.match(INTERFACE_ADDRESS_PATTERN);
    const current = interfaces[interfaces.length - 1];
    if (address && current) current.addresses.push(address[1]);
  }

  return interfaces;
};

const readConfigAddress = async (configFile: string): Promise<string> => {
  const content = await readFile(
    join(WIREGUARD_CONFIG_DIR, configFile),
    'utf-8',
  ).catch(() => '');
  const address = content.match(CONFIG_ADDRESS_PATTERN);
  return address ? address[1].trim().split(CIDR_SEPARATOR)[0] : '';
};

const toConnection = (
  configFile: string,
  address: string,
  interfaces: NetworkInterface[],
): WireguardConnection => {
  const tunnel = address
    ? interfaces.find(
        i =>
          i.name.startsWith(TUNNEL_INTERFACE_PREFIX) &&
          i.addresses.includes(address),
      )
    : undefined;
  const isActive = Boolean(
    tunnel?.flags.includes(INTERFACE_FLAG.UP) &&
      tunnel?.flags.includes(INTERFACE_FLAG.RUNNING),
  );

  return {
    name: configFile,
    interface: tunnel?.name ?? NOT_AVAILABLE,
    address: address || NOT_AVAILABLE,
    status: isActive
      ? WIREGUARD_CONNECTION_STATUS.ACTIVE
      : WIREGUARD_CONNECTION_STATUS.INACTIVE,
  };
};

const listConnections = async (): Promise<WireguardConnection[]> => {
  const entries = await readdir(WIREGUARD_CONFIG_DIR).catch((): string[] => []);
  const configFiles = entries.filter(entry => entry.endsWith(CONFIG_EXTENSION));
  if (configFiles.length === 0) return [];

  const [{ stdout }, addresses] = await Promise.all([
    runCli(IFCONFIG_CLI, []),
    Promise.all(configFiles.map(readConfigAddress)),
  ]);
  const interfaces = parseInterfaces(stdout);

  return configFiles.map((configFile, index) =>
    toConnection(configFile, addresses[index], interfaces),
  );
};

export const WireguardService = {
  listConnections,
};
