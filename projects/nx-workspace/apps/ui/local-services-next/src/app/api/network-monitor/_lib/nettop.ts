import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

// One snapshot of cumulative per-socket byte counters. Example rows:
//   apsd.437,9084,35051,
//   tcp4 10.5.0.2:53503<->17.57.144.138:5223,9084,35051,
//   tcp6 fe80::1%utun8.1026<->fe80::2%utun8.1025,3557,4581,
const NETTOP_ARGS = ['-L', '1', '-x', '-n', '-J', 'bytes_in,bytes_out'];
const NETTOP_MAX_BUFFER = 16 * 1024 * 1024;
const PROCESS_ROW_REGEX = /^.+\.(\d+)$/;
const SOCKET_ROW_REGEX = /^(tcp|udp)[46] (.+)<->(.+)$/;
const IPV4_ENDPOINT_REGEX = /^([^:]+):(\d+)$/;
const IPV6_ENDPOINT_REGEX = /^(.+)\.(\d+)$/;
const IPV4_MAPPED_PREFIX = '::ffff:';

export interface ByteCounters {
  bytesIn: number;
  bytesOut: number;
}

export const socketKey = (
  pid: number,
  protocol: string,
  localPort: number,
  remoteIp: string,
  remotePort: number,
) => [pid, protocol.toUpperCase(), localPort, remoteIp, remotePort].join('|');

const parseEndpoint = (endpoint: string) => {
  const match =
    endpoint.match(IPV4_ENDPOINT_REGEX) ?? endpoint.match(IPV6_ENDPOINT_REGEX);
  if (!match) return null;
  const ip = match[1].replace(/%.*$/, '');
  return {
    ip: ip.startsWith(IPV4_MAPPED_PREFIX)
      ? ip.slice(IPV4_MAPPED_PREFIX.length)
      : ip,
    port: Number(match[2]),
  };
};

export const readSocketCounters = async (): Promise<
  Map<string, ByteCounters>
> => {
  const { stdout } = await execFileAsync('nettop', NETTOP_ARGS, {
    maxBuffer: NETTOP_MAX_BUFFER,
  }).catch(err => ({ stdout: (err.stdout as string) ?? '' }));

  const counters = new Map<string, ByteCounters>();
  let pid: number | null = null;
  for (const line of stdout.split('\n')) {
    const [label, bytesIn, bytesOut] = line.split(',');
    if (!label) continue;
    const socket = label.match(SOCKET_ROW_REGEX);
    if (!socket) {
      const processRow = label.match(PROCESS_ROW_REGEX);
      pid = processRow ? Number(processRow[1]) : null;
      continue;
    }
    if (pid === null || !bytesIn) continue;
    const [, protocol, localField, remoteField] = socket;
    const local = parseEndpoint(localField);
    const remote = parseEndpoint(remoteField);
    if (!local || !remote) continue;
    counters.set(socketKey(pid, protocol, local.port, remote.ip, remote.port), {
      bytesIn: Number(bytesIn),
      bytesOut: Number(bytesOut),
    });
  }
  return counters;
};
