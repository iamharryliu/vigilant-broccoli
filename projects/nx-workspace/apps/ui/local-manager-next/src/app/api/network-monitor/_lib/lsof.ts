import {
  CONNECTION_SCOPE,
  ConnectionScope,
} from '../../../constants/network-monitor';

const IP_PORT_REGEX = /^(.+):(\d+)$/;
const IPV4_MAPPED_PREFIX = '::ffff:';

export const classifyIp = (ip: string): ConnectionScope => {
  if (ip.startsWith('127.') || ip === '::1') return CONNECTION_SCOPE.LOOPBACK;
  if (ip.startsWith('10.')) return CONNECTION_SCOPE.PRIVATE;
  if (ip.startsWith('192.168.')) return CONNECTION_SCOPE.PRIVATE;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(ip)) return CONNECTION_SCOPE.PRIVATE;
  if (ip.startsWith('169.254.')) return CONNECTION_SCOPE.PRIVATE;
  if (/^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./.test(ip)) {
    return CONNECTION_SCOPE.PRIVATE;
  }
  if (/^f[cde][0-9a-f]{2}:/i.test(ip)) return CONNECTION_SCOPE.PRIVATE;
  return CONNECTION_SCOPE.EXTERNAL;
};

export const parseAddr = (
  addr: string,
): { ip: string; port: number } | null => {
  if (addr.startsWith('[')) {
    const end = addr.indexOf(']');
    if (end < 0) return null;
    const ip = addr.slice(1, end).replace(/%.*$/, '');
    const port = parseInt(addr.slice(end + 2), 10);
    if (isNaN(port)) return null;
    return {
      ip: ip.startsWith(IPV4_MAPPED_PREFIX)
        ? ip.slice(IPV4_MAPPED_PREFIX.length)
        : ip,
      port,
    };
  }
  const m = addr.match(IP_PORT_REGEX);
  if (!m) return null;
  const port = parseInt(m[2], 10);
  return isNaN(port) ? null : { ip: m[1], port };
};
