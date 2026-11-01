import { FEEDS, PRODUCTS } from './security-news-digest.feeds.mjs';

const LOOKBACK_MS = 26 * 60 * 60 * 1000;
const MAX_ITEMS = 8;
const FETCH_TIMEOUT_MS = 15_000;
const EMAIL_URL =
  process.env.EMAIL_URL ?? 'http://127.0.0.1:3001/api/send-email';
const EMAIL_TO = process.env.EMAIL_TO ?? 'harryliu1995@gmail.com';
const EMAIL_FROM =
  process.env.EMAIL_FROM ?? 'Security Digest <ci-alerts@harryliu.dev>';
const SHARED_APP_TOKEN = process.env.SHARED_APP_TOKEN ?? '';
const SIGNALS = [
  {
    label: 'actively exploited',
    pattern:
      /actively exploited|exploited in the wild|in-the-wild exploitation/i,
  },
  { label: 'zero-day', pattern: /zero[- ]day|0[- ]day/i },
  {
    label: 'remote code execution',
    pattern:
      /\brce\b|remote code execution|remote code execution vulnerability/i,
  },
  {
    label: 'critical vulnerability',
    pattern:
      /\bcritical\b.{0,60}\b(?:vulnerab|security flaw|CVE-|GHSA-)|\b(?:vulnerab|security flaw|CVE-|GHSA-).{0,60}\bcritical\b|cvss\s*(?:v\d\s*)?(?:score\s*)?(?:of\s*)?9(?:\.\d+)?\b/i,
  },
  {
    label: 'supply-chain compromise',
    pattern:
      /supply[- ]chain|malicious package|typosquat|dependency confusion/i,
  },
  {
    label: 'breach or compromise',
    pattern: /breach|compromis(?:e|ed|ing)|unauthorized access/i,
  },
  {
    label: 'major outage',
    pattern:
      /\b(?:major|widespread|global|mass|system[- ]wide)\s+(?:service\s+)?(?:outage|disruption|failure)\b|\b(?:all|multiple)\s+(?:services|regions|systems)\b.{0,80}\b(?:down|unavailable|outage|disruption)\b|\bmajor incident\b/i,
  },
];
const ROUTINE_ONLY =
  /\b(new|announces?|introducing|release|released|launch(?:es|ed)?|feature|preview|beta)\b/i;
const HTML_ENTITIES = {
  amp: '&',
  apos: "'",
  gt: '>',
  lt: '<',
  quot: '"',
  '#39': "'",
};

const decodeEntities = (value = '') =>
  value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(
      /&(#x[\da-f]+|#\d+|amp|apos|gt|lt|quot|#39);/gi,
      (entity, code) => {
        if (code[0] === '#') {
          const number =
            code[1].toLowerCase() === 'x'
              ? Number.parseInt(code.slice(2), 16)
              : Number.parseInt(code.slice(1), 10);
          return Number.isFinite(number)
            ? String.fromCodePoint(number)
            : entity;
        }
        return HTML_ENTITIES[code.toLowerCase()] ?? entity;
      },
    );

const tagValue = (block, tag) => {
  const match = block.match(
    new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'),
  );
  return decodeEntities(match?.[1]?.replace(/<[^>]*>/g, ' ').trim() ?? '');
};

const parseXmlFeed = (xml, source) => {
  const blocks = [...xml.matchAll(/<(item|entry)\b[^>]*>([\s\S]*?)<\/\1>/gi)];
  return blocks
    .map(([, , block]) => {
      const linkTag = block.match(
        /<link\b([^>]*)>([\s\S]*?)<\/link>|<link\b([^>]*)\/>/i,
      );
      const href =
        linkTag?.[1]?.match(/href=["']([^"']+)/i)?.[1] ??
        linkTag?.[3]?.match(/href=["']([^"']+)/i)?.[1];
      const link = href ?? decodeEntities(linkTag?.[2]?.trim() ?? '');
      return {
        title: tagValue(block, 'title'),
        description:
          tagValue(block, 'description') ||
          tagValue(block, 'summary') ||
          tagValue(block, 'content'),
        date:
          tagValue(block, 'pubDate') ||
          tagValue(block, 'published') ||
          tagValue(block, 'updated'),
        link,
        source,
      };
    })
    .filter(({ title, link }) => title && link);
};

const parseFeed = (body, feed) => {
  if (feed.format === 'rss') return parseXmlFeed(body, feed.name);
  const data = JSON.parse(body);
  if (feed.format === 'kev') {
    return (data.vulnerabilities ?? []).map(entry => ({
      title: `${entry.cveID}: ${entry.vulnerabilityName}`,
      description: `${entry.product} by ${entry.vendorProject}. ${entry.shortDescription}`,
      date: entry.dateAdded,
      link: entry.notes || `https://nvd.nist.gov/vuln/detail/${entry.cveID}`,
      source: feed.name,
      kev: true,
    }));
  }
  return data.map(entry => ({
    title: entry.summary ?? entry.html_url,
    description: `${entry.description ?? ''} ${
      entry.vulnerabilities
        ?.map(({ package: pkg }) => pkg?.name)
        .filter(Boolean)
        .join(' ') ?? ''
    }`,
    date: entry.published_at,
    link: entry.html_url,
    source: feed.name,
    severity: entry.severity,
    cvss: entry.cvss?.score,
  }));
};

const hasProduct = (text, keyword) => {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(
    `(^|[^\\p{L}\\p{N}])${escaped}($|[^\\p{L}\\p{N}])`,
    'iu',
  ).test(text);
};

export const matchSecurityItems = (items, now = Date.now()) => {
  const earliest = now - LOOKBACK_MS;
  const selected = items.flatMap(item => {
    const published = Date.parse(item.date);
    if (
      !Number.isFinite(published) ||
      published < earliest ||
      published > now + 60_000
    )
      return [];
    const text = `${item.title} ${item.description}`;
    const product = PRODUCTS.find(({ keywords }) =>
      keywords.some(keyword => hasProduct(text, keyword)),
    );
    if (!product) return [];
    const signal = item.kev
      ? 'CISA Known Exploited Vulnerabilities listing'
      : item.cvss >= 9 || item.severity === 'critical'
        ? `critical advisory${item.cvss >= 9 ? ` (CVSS ${item.cvss})` : ''}`
        : SIGNALS.find(({ pattern }) => pattern.test(text))?.label;
    if (
      !signal ||
      (ROUTINE_ONLY.test(item.title) &&
        !/cve-|ghsa-/i.test(item.title) &&
        !item.kev &&
        !SIGNALS.some(({ pattern }) => pattern.test(text)))
    )
      return [];
    return [{ ...item, product: product.name, reason: signal, published }];
  });
  const unique = [...new Map(selected.map(item => [item.link, item])).values()];
  return unique
    .sort((left, right) => right.published - left.published)
    .slice(0, MAX_ITEMS);
};

const escapeHtml = value =>
  value.replace(
    /[&<>"']/g,
    character =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        character
      ],
  );

const createEmail = items => {
  const subject = `Security digest: ${items.length} high-impact item${items.length === 1 ? '' : 's'}`;
  const text = [
    'High-impact security or service incidents affecting products in the vigilant-broccoli stack:',
    '',
    ...items.flatMap(item => [
      `${item.title}`,
      `Source: ${item.source} | Product: ${item.product} | Why flagged: ${item.reason}`,
      item.link,
      '',
    ]),
  ].join('\n');
  const html = `<p>High-impact security or service incidents affecting products in the vigilant-broccoli stack:</p><ul>${items.map(item => `<li><a href="${escapeHtml(item.link)}">${escapeHtml(item.title)}</a><br><small>${escapeHtml(item.source)} · ${escapeHtml(item.product)} · ${escapeHtml(item.reason)}</small></li>`).join('')}</ul>`;
  return { subject, text, html };
};

const fetchFeed = async feed => {
  const response = await fetch(feed.url, {
    headers: {
      'User-Agent': 'vigilant-broccoli-security-digest/1.0',
      Accept:
        feed.format === 'github-advisories'
          ? 'application/vnd.github+json'
          : '*/*',
    },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!response.ok)
    throw new Error(`${response.status} ${response.statusText}`);
  return parseFeed(await response.text(), feed);
};

const main = async () => {
  const results = await Promise.allSettled(FEEDS.map(fetchFeed));
  const failed = results.flatMap((result, index) =>
    result.status === 'rejected' ? [{ result, feed: FEEDS[index] }] : [],
  );
  if (failed.length === FEEDS.length)
    throw new Error(`All ${FEEDS.length} security feeds failed`);
  failed.forEach(({ result, feed }) =>
    console.warn(`Feed failed: ${feed.name}: ${result.reason.message}`),
  );
  const items = matchSecurityItems(
    results
      .filter(({ status }) => status === 'fulfilled')
      .flatMap(({ value }) => value),
  );
  console.log(`Security digest: ${items.length} qualifying item(s)`);
  if (process.env.DRY_RUN === '1') {
    console.log(
      items.length
        ? JSON.stringify(
            items.map(({ title, source, product, reason, link }) => ({
              title,
              source,
              product,
              reason,
              link,
            })),
            null,
            2,
          )
        : 'No qualifying items; no email would be sent.',
    );
    return;
  }
  if (!items.length) return;
  const response = await fetch(EMAIL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': SHARED_APP_TOKEN,
    },
    body: JSON.stringify({
      to: EMAIL_TO,
      from: EMAIL_FROM,
      ...createEmail(items),
    }),
  });
  console.log(`security-news-digest email: ${response.status}`);
  if (!response.ok) process.exitCode = 1;
};

if (import.meta.url === `file://${process.argv[1]}`) await main();
