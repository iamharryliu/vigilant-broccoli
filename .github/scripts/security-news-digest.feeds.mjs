export const FEEDS = [
  {
    name: 'CISA Known Exploited Vulnerabilities',
    url: 'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json',
    format: 'kev',
  },
  {
    name: 'GitHub Security Advisories',
    url: 'https://api.github.com/advisories?per_page=100',
    format: 'github-advisories',
  },
  {
    name: 'Node.js Security Releases',
    url: 'https://nodejs.org/en/feed/vulnerability.xml',
    format: 'rss',
  },
  {
    name: 'Fly.io Status',
    url: 'https://status.fly.io/history.rss',
    format: 'rss',
  },
  {
    name: 'Docker Status',
    url: 'https://www.dockerstatus.com/history.rss',
    format: 'rss',
  },
  {
    name: 'Proton Status',
    url: 'https://status.proton.me/history.rss',
    format: 'rss',
  },
  {
    name: 'Proton Blog',
    url: 'https://proton.me/blog/feed',
    format: 'rss',
  },
  {
    name: 'BleepingComputer',
    url: 'https://www.bleepingcomputer.com/feed/',
    format: 'rss',
  },
  {
    name: 'Cloudflare Status',
    url: 'https://www.cloudflarestatus.com/history.rss',
    format: 'rss',
  },
  {
    name: 'GitHub Status',
    url: 'https://www.githubstatus.com/history.rss',
    format: 'rss',
  },
];

export const PRODUCTS = [
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
  { name: 'Fastify', keywords: ['fastify', '@fastify'] },
  { name: 'Fly.io', keywords: ['fly.io', 'flyio', 'flyctl'] },
  {
    name: 'GitHub',
    keywords: ['github', 'github actions', 'github enterprise'],
  },
  { name: 'HashiCorp Vault', keywords: ['hashicorp vault', 'vault'] },
  { name: 'Node.js', keywords: ['node.js', 'nodejs', 'node runtime'] },
  { name: 'npm / pnpm', keywords: ['npm', 'pnpm', 'node package manager'] },
  { name: 'Next.js / Vercel', keywords: ['next.js', 'nextjs', 'vercel'] },
  { name: 'Proton', keywords: ['proton', 'proton mail', 'protonmail'] },
  { name: 'RabbitMQ', keywords: ['rabbitmq', 'rabbit mq'] },
  { name: 'Resend', keywords: ['resend'] },
  { name: 'Supabase', keywords: ['supabase', 'postgrest', 'gotrue'] },
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
