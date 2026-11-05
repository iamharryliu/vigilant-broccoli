import { promises as fs, existsSync } from 'fs';

const OUI_PATHS = [
  '/opt/homebrew/share/nmap/nmap-mac-prefixes',
  '/usr/local/share/nmap/nmap-mac-prefixes',
  '/usr/share/nmap/nmap-mac-prefixes',
];
const OUI_LINE_REGEX = /^([0-9A-Fa-f]{6})\s+(.+)$/;
const LOCALLY_ADMIN_BIT = 0x02;

let cache: Map<string, string> | null = null;
let loadPromise: Promise<Map<string, string>> | null = null;

const normalizeMacOctet = (octet: string): string =>
  octet.length === 1 ? `0${octet}` : octet;

const normalizeMac = (mac: string): string =>
  mac.split(':').map(normalizeMacOctet).join(':').toLowerCase();

const macPrefix = (mac: string): string =>
  normalizeMac(mac).replace(/:/g, '').slice(0, 6);

export const isLocallyAdministered = (mac: string): boolean => {
  const firstOctet = parseInt(normalizeMac(mac).split(':')[0], 16);
  if (isNaN(firstOctet)) return false;
  return (firstOctet & LOCALLY_ADMIN_BIT) !== 0;
};

const loadOuiMap = async (): Promise<Map<string, string>> => {
  const map = new Map<string, string>();
  const path = OUI_PATHS.find(p => existsSync(p));
  if (!path) return map;

  const content = await fs.readFile(path, 'utf8');
  for (const line of content.split('\n')) {
    if (line.startsWith('#') || !line.trim()) continue;
    const match = line.match(OUI_LINE_REGEX);
    if (!match) continue;
    map.set(match[1].toLowerCase(), match[2].trim());
  }
  return map;
};

const ensureLoaded = async (): Promise<Map<string, string>> => {
  if (cache) return cache;
  if (!loadPromise) {
    loadPromise = loadOuiMap().then(m => {
      cache = m;
      return m;
    });
  }
  return loadPromise;
};

export const lookupVendor = async (mac: string): Promise<string | null> => {
  const map = await ensureLoaded();
  return map.get(macPrefix(mac)) ?? null;
};
