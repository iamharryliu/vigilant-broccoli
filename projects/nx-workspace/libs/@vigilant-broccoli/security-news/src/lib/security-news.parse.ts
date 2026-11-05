import { Feed, FEED_FORMAT } from './security-news.feeds';

export type FeedItem = {
  title: string;
  description: string;
  date: string;
  link: string;
  source: string;
  kev?: boolean;
  advisory?: boolean;
  status?: boolean;
  severity?: string | null;
  cvss?: number | null;
};

type KevEntry = {
  cveID: string;
  vulnerabilityName: string;
  product: string;
  vendorProject: string;
  shortDescription: string;
  dateAdded: string;
  notes?: string;
};

type GithubAdvisory = {
  summary?: string;
  description?: string;
  html_url: string;
  published_at: string;
  severity?: string | null;
  cvss?: { score?: number | null };
  vulnerabilities?: { package?: { name?: string } | null }[];
};

const HTML_ENTITIES: Record<string, string> = {
  amp: '&',
  apos: "'",
  gt: '>',
  lt: '<',
  quot: '"',
  '#39': "'",
};
const HEX_RADIX = 16;
const DECIMAL_RADIX = 10;

const decodeEntities = (value = '') =>
  value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(
      /&(#x[\da-f]+|#\d+|amp|apos|gt|lt|quot|#39);/gi,
      (entity, code: string) => {
        if (code[0] === '#' && code !== '#39') {
          const number =
            code[1].toLowerCase() === 'x'
              ? Number.parseInt(code.slice(2), HEX_RADIX)
              : Number.parseInt(code.slice(1), DECIMAL_RADIX);
          return Number.isFinite(number)
            ? String.fromCodePoint(number)
            : entity;
        }
        return HTML_ENTITIES[code.toLowerCase()] ?? entity;
      },
    );

const tagValue = (block: string, tag: string) => {
  const match = block.match(
    new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'),
  );
  return decodeEntities(match?.[1]?.replace(/<[^>]*>/g, ' ').trim() ?? '');
};

const parseXmlFeed = (xml: string, source: string): FeedItem[] =>
  [...xml.matchAll(/<(item|entry)\b[^>]*>([\s\S]*?)<\/\1>/gi)]
    .map(([, , block]) => {
      const linkTag = block.match(
        /<link\b([^>]*)>([\s\S]*?)<\/link>|<link\b([^>]*)\/>/i,
      );
      const href =
        linkTag?.[1]?.match(/href=["']([^"']+)/i)?.[1] ??
        linkTag?.[3]?.match(/href=["']([^"']+)/i)?.[1];
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
        link: href ?? decodeEntities(linkTag?.[2]?.trim() ?? ''),
        source,
      };
    })
    .filter(({ title, link }) => title && link);

export const parseFeed = (body: string, feed: Feed): FeedItem[] => {
  if (feed.format === FEED_FORMAT.RSS)
    return parseXmlFeed(body, feed.name).map(item => ({
      ...item,
      status: feed.status,
    }));
  if (feed.format === FEED_FORMAT.KEV) {
    const data = JSON.parse(body) as { vulnerabilities?: KevEntry[] };
    return (data.vulnerabilities ?? []).map(entry => ({
      title: `${entry.cveID}: ${entry.vulnerabilityName}`,
      description: `${entry.product} by ${entry.vendorProject}. ${entry.shortDescription}`,
      date: entry.dateAdded,
      link: entry.notes || `https://nvd.nist.gov/vuln/detail/${entry.cveID}`,
      source: feed.name,
      kev: true,
    }));
  }
  return (JSON.parse(body) as GithubAdvisory[]).map(entry => ({
    title: entry.summary ?? entry.html_url,
    description: '',
    date: entry.published_at,
    link: entry.html_url,
    source: feed.name,
    advisory: true,
    severity: entry.severity,
    cvss: entry.cvss?.score,
  }));
};
