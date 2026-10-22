import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import { HTTP_METHOD, HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';

const URL_PATTERN = /https?:\/\/[^\s<>"')]+/gi;
const MAX_URLS = 3;
const MAX_REDIRECTS = 3;
const FETCH_TIMEOUT_MS = 8000;
const MAX_BODY_BYTES = 1_000_000;
const MAX_TEXT_CHARS = 6000;
const MAX_JSON_LD_CHARS = 4000;
const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);
const USER_AGENT = 'Mozilla/5.0 (compatible; vb-express-calendar-parser)';

const JSON_LD_PATTERN =
  /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
const META_PATTERN =
  /<meta[^>]+(?:property|name)=["'](og:title|og:description|description)["'][^>]*content=["']([^"']*)["'][^>]*>/gi;
// Hydration JSON (e.g. Next.js __NEXT_DATA__) often holds the event time when
// the page has no JSON-LD, such as Luma links that carry an invite token.
const DATE_FIELD_PATTERN =
  /"(start_at|end_at|startDate|endDate|timezone)":"([^"]+)"/g;
const HYDRATION_FIELDS = [
  'start_at',
  'end_at',
  'startDate',
  'endDate',
  'timezone',
];
const TITLE_PATTERN = /<title[^>]*>([\s\S]*?)<\/title>/i;

const isPrivateIPv4 = (ip: string): boolean => {
  const [a, b] = ip.split('.').map(Number);
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    a >= 224
  );
};

const isPrivateIPv6 = (ip: string): boolean => {
  const lower = ip.toLowerCase();
  const mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isPrivateIPv4(mapped[1]);
  return (
    lower === '::' ||
    lower === '::1' ||
    lower.startsWith('fc') ||
    lower.startsWith('fd') ||
    lower.startsWith('fe8') ||
    lower.startsWith('fe9') ||
    lower.startsWith('fea') ||
    lower.startsWith('feb')
  );
};

const isPrivateAddress = (ip: string): boolean =>
  isIP(ip) === 4 ? isPrivateIPv4(ip) : isPrivateIPv6(ip);

// Resolves the hostname and rejects internal targets so a pasted link cannot
// reach Fly's private network or cloud metadata endpoints. Redirect hops are
// re-checked by the caller.
const assertPublicUrl = async (url: URL): Promise<void> => {
  if (!ALLOWED_PROTOCOLS.has(url.protocol)) {
    throw new Error(`Unsupported protocol ${url.protocol}`);
  }
  const hostname = url.hostname.replace(/^\[|\]$/g, '');
  const addresses = isIP(hostname)
    ? [{ address: hostname }]
    : await lookup(hostname, { all: true });
  if (
    addresses.length === 0 ||
    addresses.some(a => isPrivateAddress(a.address))
  ) {
    throw new Error('URL resolves to a non-public address');
  }
};

const readCapped = async (res: Response): Promise<string> => {
  const reader = res.body?.getReader();
  if (!reader) return '';
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (total < MAX_BODY_BYTES) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    total += value.length;
  }
  await reader.cancel().catch(() => undefined);
  return Buffer.concat(chunks).toString('utf8');
};

const fetchHtml = async (startUrl: string): Promise<string> => {
  let current = new URL(startUrl);
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    await assertPublicUrl(current);
    const res = await fetch(current, {
      method: HTTP_METHOD.GET,
      redirect: 'manual',
      headers: { 'User-Agent': USER_AGENT, Accept: 'text/html' },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    const location = res.headers.get('location');
    if (res.status >= 300 && res.status < 400 && location) {
      current = new URL(location, current);
      continue;
    }
    if (res.status !== HTTP_STATUS_CODES.OK) {
      throw new Error(`Page returned ${res.status}`);
    }
    return readCapped(res);
  }
  throw new Error('Too many redirects');
};

// `&amp;` must be decoded last: decoding it first would turn `&amp;lt;` into
// `<` (double unescaping).
const decodeEntities = (s: string): string =>
  s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&amp;/g, '&');

const htmlToText = (html: string): string =>
  decodeEntities(
    html
      .replace(/<(script|style|noscript|svg)[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/\s+/g, ' ')
    .trim();

const summarizeHtml = (url: string, html: string): string => {
  const parts: string[] = [`Source: ${url}`];
  const title = html.match(TITLE_PATTERN)?.[1];
  if (title) parts.push(`Title: ${decodeEntities(title.trim())}`);
  for (const [, name, content] of html.matchAll(META_PATTERN)) {
    parts.push(`${name}: ${decodeEntities(content)}`);
  }
  for (const [, json] of html.matchAll(JSON_LD_PATTERN)) {
    parts.push(`Structured data: ${json.trim().slice(0, MAX_JSON_LD_CHARS)}`);
  }
  const seen = new Map<string, string>();
  for (const [, key, value] of html.matchAll(DATE_FIELD_PATTERN)) {
    if (HYDRATION_FIELDS.includes(key) && !seen.has(key)) seen.set(key, value);
  }
  if (seen.size > 0) {
    parts.push(
      `Event fields: ${[...seen].map(([k, v]) => `${k}=${v}`).join(', ')}`,
    );
  }
  parts.push(`Page text: ${htmlToText(html).slice(0, MAX_TEXT_CHARS)}`);
  return parts.join('\n');
};

const TRAILING_PUNCTUATION = new Set(['.', ',', ';']);

// A loop instead of `/[.,;]+$/`, which backtracks quadratically on long runs
// of punctuation in user-supplied links.
const stripTrailingPunctuation = (url: string): string => {
  let end = url.length;
  while (end > 0 && TRAILING_PUNCTUATION.has(url[end - 1])) end--;
  return url.slice(0, end);
};

export const extractUrls = (text: string): string[] => [
  ...new Set((text.match(URL_PATTERN) ?? []).map(stripTrailingPunctuation)),
];

// Returns readable summaries of linked pages; unreachable or blocked links are
// skipped so the rest of the text can still be parsed.
export const fetchLinkedPages = async (text: string): Promise<string[]> => {
  const results = await Promise.allSettled(
    extractUrls(text)
      .slice(0, MAX_URLS)
      .map(async url => summarizeHtml(url, await fetchHtml(url))),
  );
  return results.flatMap(r => (r.status === 'fulfilled' ? [r.value] : []));
};
