export const FEED_FORMAT = {
  KEV: 'kev',
  GITHUB_ADVISORIES: 'github-advisories',
  RSS: 'rss',
} as const;

export type FeedFormat = (typeof FEED_FORMAT)[keyof typeof FEED_FORMAT];

export type Feed = {
  name: string;
  url: string;
  format: FeedFormat;
  status?: boolean;
};

export const FEEDS: Feed[] = [
  {
    name: 'CISA Known Exploited Vulnerabilities',
    url: 'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json',
    format: FEED_FORMAT.KEV,
  },
  {
    name: 'GitHub Security Advisories',
    url: 'https://api.github.com/advisories?per_page=100',
    format: FEED_FORMAT.GITHUB_ADVISORIES,
  },
  {
    name: 'Node.js Security Releases',
    url: 'https://nodejs.org/en/feed/vulnerability.xml',
    format: FEED_FORMAT.RSS,
  },
  {
    name: 'Fly.io Status',
    url: 'https://status.fly.io/history.rss',
    format: FEED_FORMAT.RSS,
    status: true,
  },
  {
    name: 'Docker Status',
    url: 'https://www.dockerstatus.com/history.rss',
    format: FEED_FORMAT.RSS,
    status: true,
  },
  {
    name: 'Proton Status',
    url: 'https://status.proton.me/history.rss',
    format: FEED_FORMAT.RSS,
    status: true,
  },
  {
    name: 'Proton Blog',
    url: 'https://proton.me/blog/feed',
    format: FEED_FORMAT.RSS,
  },
  {
    name: 'BleepingComputer',
    url: 'https://www.bleepingcomputer.com/feed/',
    format: FEED_FORMAT.RSS,
  },
  {
    name: 'Cloudflare Status',
    url: 'https://www.cloudflarestatus.com/history.rss',
    format: FEED_FORMAT.RSS,
    status: true,
  },
  {
    name: 'GitHub Status',
    url: 'https://www.githubstatus.com/history.rss',
    format: FEED_FORMAT.RSS,
    status: true,
  },
];
