export const FEED_FORMAT = {
  KEV: 'kev',
  GITHUB_ADVISORIES: 'github-advisories',
  RSS: 'rss',
} as const;

export type FeedFormat = (typeof FEED_FORMAT)[keyof typeof FEED_FORMAT];

export type Feed = { name: string; url: string; format: FeedFormat };

export type Product = {
  name: string;
  keywords: string[];
  packages?: string[];
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
  },
  {
    name: 'Docker Status',
    url: 'https://www.dockerstatus.com/history.rss',
    format: FEED_FORMAT.RSS,
  },
  {
    name: 'Proton Status',
    url: 'https://status.proton.me/history.rss',
    format: FEED_FORMAT.RSS,
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
  },
  {
    name: 'GitHub Status',
    url: 'https://www.githubstatus.com/history.rss',
    format: FEED_FORMAT.RSS,
  },
];

export const PRODUCTS: Product[] = [
  {
    name: 'Cloudflare',
    keywords: [
      'cloudflare',
      'cloudflare pages',
      'cloudflare workers',
      'cloudflare r2',
      'wrangler',
    ],
  },
  { name: 'Docker', keywords: ['docker', 'docker hub', 'containerd', 'moby'] },
  {
    name: 'Fastify',
    keywords: ['fastify'],
    packages: ['fastify', '@fastify/'],
  },
  { name: 'Fly.io', keywords: ['fly.io', 'flyio', 'flyctl'] },
  {
    name: 'GitHub',
    keywords: ['github', 'github actions', 'github enterprise'],
  },
  { name: 'HashiCorp Vault', keywords: ['hashicorp vault', 'vault'] },
  { name: 'Node.js', keywords: ['node.js', 'nodejs', 'node runtime'] },
  {
    name: 'npm / pnpm',
    keywords: ['npm', 'pnpm', 'node package manager'],
    packages: ['npm', 'pnpm'],
  },
  {
    name: 'Next.js / Vercel',
    keywords: ['next.js', 'nextjs', 'vercel'],
    packages: ['next', '@next/', 'vercel'],
  },
  { name: 'Proton', keywords: ['proton', 'proton mail', 'protonmail'] },
  { name: 'RabbitMQ', keywords: ['rabbitmq', 'rabbit mq'] },
  { name: 'Resend', keywords: ['resend'] },
  {
    name: 'Supabase',
    keywords: ['supabase', 'postgrest', 'gotrue'],
    packages: ['@supabase/'],
  },
  {
    name: 'Terraform',
    keywords: [
      'terraform',
      'terraform cloud',
      'hcp terraform',
      'hashicorp terraform',
    ],
  },
];
