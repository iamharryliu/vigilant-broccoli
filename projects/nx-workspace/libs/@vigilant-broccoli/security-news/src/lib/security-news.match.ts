import { FeedItem } from './security-news.parse';

export type SecurityNewsItem = {
  title: string;
  source: string;
  reason: string;
  link: string;
  published: number;
};

const MS_PER_HOUR = 60 * 60 * 1000;
export const LOOKBACK_DAYS = 7;
const LOOKBACK_MS = LOOKBACK_DAYS * 24 * MS_PER_HOUR;
const CLOCK_SKEW_MS = 60_000;
const MAX_ITEMS = 50;
const CRITICAL_CVSS = 9;
const CRITICAL_SEVERITY = 'critical';
const KEV_REASON = 'CISA Known Exploited Vulnerabilities listing';

const SIGNALS = [
  {
    label: 'actively exploited',
    pattern:
      /actively exploited|exploited in the wild|in-the-wild exploitation/i,
  },
  { label: 'zero-day', pattern: /zero[- ]day|0[- ]day/i },
  {
    label: 'remote code execution',
    pattern: /\brce\b|remote code execution/i,
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
    pattern: /\bbreach(?:ed)?\b|\bcompromised\b|\bdata leak/i,
  },
  {
    label: 'major outage',
    pattern:
      /\b(?:major|widespread|global|mass|system[- ]wide)\s+(?:service\s+)?(?:outage|disruption|failure)\b|\b(?:all|multiple)\s+(?:services|regions|systems)\b.{0,80}\b(?:down|unavailable|outage|disruption)\b|\bmajor incident\b/i,
  },
];

const ROUTINE_ONLY =
  /\b(new|announces?|introducing|release|released|launch(?:es|ed)?|feature|preview|beta)\b/i;
const STATUS_OUTAGE =
  /\boutage\b|\b(?:unavailable|unreachable)\b|\b(?:is|are|was|were)\s+down\b|\bmajor incident\b/i;
const STATUS_REASON = 'major outage';
const VULNERABILITY_ID = /cve-|ghsa-/i;

// Status-page RSS carries no impact level, only prose, so outage wording in the
// incident text is the signal. Advisory prose uses loose words like
// "compromise", so only the registry's own severity rating can flag one.
const getReason = (item: FeedItem, text: string) => {
  if (item.kev) return KEV_REASON;
  if ((item.cvss ?? 0) >= CRITICAL_CVSS)
    return `critical advisory (CVSS ${item.cvss})`;
  if (item.severity === CRITICAL_SEVERITY) return 'critical advisory';
  if (item.advisory) return undefined;
  if (item.status) return STATUS_OUTAGE.test(text) ? STATUS_REASON : undefined;
  return SIGNALS.find(({ pattern }) => pattern.test(text))?.label;
};

export const matchSecurityItems = (
  items: FeedItem[],
  now = Date.now(),
): SecurityNewsItem[] => {
  const earliest = now - LOOKBACK_MS;
  const selected = items.flatMap(item => {
    const published = Date.parse(item.date);
    if (
      !Number.isFinite(published) ||
      published < earliest ||
      published > now + CLOCK_SKEW_MS
    )
      return [];
    const text = `${item.title} ${item.description}`;
    const reason = getReason(item, text);
    const routine =
      ROUTINE_ONLY.test(item.title) &&
      !VULNERABILITY_ID.test(item.title) &&
      !item.kev &&
      !item.status &&
      !SIGNALS.some(({ pattern }) => pattern.test(text));
    if (!reason || routine) return [];
    return [
      {
        title: item.title,
        source: item.source,
        reason,
        link: item.link,
        published,
      },
    ];
  });
  return [...new Map(selected.map(item => [item.link, item])).values()]
    .sort((left, right) => right.published - left.published)
    .slice(0, MAX_ITEMS);
};
