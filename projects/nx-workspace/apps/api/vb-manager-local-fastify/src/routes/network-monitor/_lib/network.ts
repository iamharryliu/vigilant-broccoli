import { exec } from 'child_process';
import { promisify } from 'util';
import { promises as dns } from 'dns';

const execAsync = promisify(exec);

const NETSTAT_CMD = 'netstat -rn -f inet';
const REVERSE_DNS_TIMEOUT_MS = 800;

export const getDefaultGateways = async (): Promise<Set<string>> => {
  const { stdout } = await execAsync(NETSTAT_CMD).catch(() => ({ stdout: '' }));
  const gateways = new Set<string>();
  for (const line of stdout.split('\n')) {
    const parts = line.trim().split(/\s+/);
    if (parts[0] !== 'default') continue;
    if (parts[1] && /^[\d.]+$/.test(parts[1])) gateways.add(parts[1]);
  }
  return gateways;
};

const reverseLookupWithTimeout = async (ip: string): Promise<string | null> => {
  const lookup = dns.reverse(ip).then(names => names[0] ?? null);
  const timeout = new Promise<null>(resolve =>
    setTimeout(() => resolve(null), REVERSE_DNS_TIMEOUT_MS),
  );
  return Promise.race([lookup, timeout]).catch(() => null);
};

export const resolveHostnames = async (
  ips: string[],
): Promise<Map<string, string | null>> => {
  const entries = await Promise.all(
    ips.map(async ip => [ip, await reverseLookupWithTimeout(ip)] as const),
  );
  return new Map(entries);
};
