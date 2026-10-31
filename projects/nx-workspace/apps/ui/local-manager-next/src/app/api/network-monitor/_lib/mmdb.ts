import { isIPv4, isIPv6 } from 'net';

// Minimal reader for the MaxMind DB format
// (https://maxmind.github.io/MaxMind-DB/), enough to look up DB-IP Lite City
// records without pulling in a dependency.

const METADATA_MARKER = Buffer.from('abcdef4d61784d696e642e636f6d', 'hex');
const DATA_SECTION_SEPARATOR_BYTES = 16;
const IPV4_BITS = 32;
const IPV6_BITS = 128;
const IPV4_SUBTREE_DEPTH = 96;

const DATA_TYPE = {
  EXTENDED: 0,
  POINTER: 1,
  UTF8_STRING: 2,
  DOUBLE: 3,
  BYTES: 4,
  UINT16: 5,
  UINT32: 6,
  MAP: 7,
  INT32: 8,
  UINT64: 9,
  UINT128: 10,
  ARRAY: 11,
  BOOLEAN: 14,
  FLOAT: 15,
} as const;

type MmdbValue =
  | string
  | number
  | bigint
  | boolean
  | Buffer
  | MmdbValue[]
  | { [key: string]: MmdbValue };

interface Decoded {
  value: MmdbValue;
  next: number;
}

const readUint = (buf: Buffer, offset: number, size: number): number => {
  let n = 0;
  for (let i = 0; i < size; i++) n = n * 256 + buf[offset + i];
  return n;
};

const readBigUint = (buf: Buffer, offset: number, size: number): bigint => {
  let n = BigInt(0);
  for (let i = 0; i < size; i++) n = (n << BigInt(8)) | BigInt(buf[offset + i]);
  return n;
};

const createDecoder = (buf: Buffer, sectionStart: number) => {
  const decodePointer = (ctrl: number, offset: number): Decoded => {
    const sizeBits = (ctrl >> 3) & 0x3;
    const high = ctrl & 0x7;
    const pointerBases = [0, 2048, 526336, 0];
    const raw =
      sizeBits === 3
        ? readUint(buf, offset, 4)
        : high * 2 ** (8 * (sizeBits + 1)) +
          readUint(buf, offset, sizeBits + 1);
    const target = sectionStart + raw + pointerBases[sizeBits];
    return { value: decode(target).value, next: offset + sizeBits + 1 };
  };

  const decode = (offset: number): Decoded => {
    const ctrl = buf[offset++];
    let type = ctrl >> 5;
    if (type === DATA_TYPE.POINTER) return decodePointer(ctrl, offset);
    if (type === DATA_TYPE.EXTENDED) type = 7 + buf[offset++];

    let size = ctrl & 0x1f;
    if (size === 29) size = 29 + buf[offset++];
    else if (size === 30) {
      size = 285 + readUint(buf, offset, 2);
      offset += 2;
    } else if (size === 31) {
      size = 65821 + readUint(buf, offset, 3);
      offset += 3;
    }

    switch (type) {
      case DATA_TYPE.UTF8_STRING:
        return {
          value: buf.toString('utf8', offset, offset + size),
          next: offset + size,
        };
      case DATA_TYPE.DOUBLE:
        return { value: buf.readDoubleBE(offset), next: offset + 8 };
      case DATA_TYPE.FLOAT:
        return { value: buf.readFloatBE(offset), next: offset + 4 };
      case DATA_TYPE.BYTES:
        return {
          value: buf.subarray(offset, offset + size),
          next: offset + size,
        };
      case DATA_TYPE.UINT16:
      case DATA_TYPE.UINT32:
        return { value: readUint(buf, offset, size), next: offset + size };
      case DATA_TYPE.INT32:
        return {
          value:
            size === 4 ? buf.readInt32BE(offset) : readUint(buf, offset, size),
          next: offset + size,
        };
      case DATA_TYPE.UINT64:
      case DATA_TYPE.UINT128:
        return { value: readBigUint(buf, offset, size), next: offset + size };
      case DATA_TYPE.BOOLEAN:
        return { value: size !== 0, next: offset };
      case DATA_TYPE.MAP: {
        const map: Record<string, MmdbValue> = {};
        for (let i = 0; i < size; i++) {
          const key = decode(offset);
          const val = decode(key.next);
          map[String(key.value)] = val.value;
          offset = val.next;
        }
        return { value: map, next: offset };
      }
      case DATA_TYPE.ARRAY: {
        const arr: MmdbValue[] = [];
        for (let i = 0; i < size; i++) {
          const item = decode(offset);
          arr.push(item.value);
          offset = item.next;
        }
        return { value: arr, next: offset };
      }
      default:
        throw new Error(`Unsupported MMDB data type ${type}`);
    }
  };

  return decode;
};

const ipToBits = (ip: string): number[] | null => {
  if (isIPv4(ip)) {
    return ip.split('.').flatMap(octet => {
      const n = Number(octet);
      return Array.from({ length: 8 }, (_, i) => (n >> (7 - i)) & 1);
    });
  }
  if (!isIPv6(ip)) return null;
  const [head, tail = ''] = ip.split('::');
  const headGroups = head ? head.split(':') : [];
  const tailGroups = tail ? tail.split(':') : [];
  const missing = 8 - headGroups.length - tailGroups.length;
  const groups = ip.includes('::')
    ? [...headGroups, ...Array(missing).fill('0'), ...tailGroups]
    : headGroups;
  return groups.flatMap(group => {
    const n = parseInt(group, 16);
    return Array.from({ length: 16 }, (_, i) => (n >> (15 - i)) & 1);
  });
};

export type MmdbReader = {
  get: (ip: string) => Record<string, MmdbValue> | null;
};

export const openMmdb = (buf: Buffer): MmdbReader => {
  const metaStart = buf.lastIndexOf(METADATA_MARKER);
  if (metaStart < 0) throw new Error('Invalid MMDB: metadata marker missing');
  const metaOffset = metaStart + METADATA_MARKER.length;
  const metadata = createDecoder(buf, metaOffset)(metaOffset).value as Record<
    string,
    number
  >;
  const nodeCount = Number(metadata.node_count);
  const recordSize = Number(metadata.record_size);
  const ipVersion = Number(metadata.ip_version);
  const nodeBytes = (recordSize * 2) / 8;
  const treeSize = nodeCount * nodeBytes;
  const dataStart = treeSize + DATA_SECTION_SEPARATOR_BYTES;
  const decode = createDecoder(buf, dataStart);

  const readRecord = (node: number, bit: number): number => {
    const base = node * nodeBytes;
    if (recordSize === 24) return readUint(buf, base + bit * 3, 3);
    if (recordSize === 32) return readUint(buf, base + bit * 4, 4);
    if (recordSize === 28) {
      const middle = buf[base + 3];
      return bit === 0
        ? ((middle & 0xf0) << 20) | readUint(buf, base, 3)
        : ((middle & 0x0f) << 24) | readUint(buf, base + 4, 3);
    }
    throw new Error(`Unsupported MMDB record size ${recordSize}`);
  };

  let ipv4StartNode = 0;
  if (ipVersion === 6) {
    for (let i = 0; i < IPV4_SUBTREE_DEPTH && ipv4StartNode < nodeCount; i++) {
      ipv4StartNode = readRecord(ipv4StartNode, 0);
    }
  }

  const get = (ip: string) => {
    const bits = ipToBits(ip);
    if (!bits) return null;
    if (bits.length === IPV6_BITS && ipVersion === 4) return null;
    let node = bits.length === IPV4_BITS ? ipv4StartNode : 0;
    for (const bit of bits) {
      if (node >= nodeCount) break;
      node = readRecord(node, bit);
    }
    if (node <= nodeCount) return null;
    const offset = node - nodeCount - DATA_SECTION_SEPARATOR_BYTES;
    return decode(dataStart + offset).value as Record<string, MmdbValue>;
  };

  return { get };
};
