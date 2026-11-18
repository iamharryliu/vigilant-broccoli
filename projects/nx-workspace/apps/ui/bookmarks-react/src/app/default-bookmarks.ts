import { OPEN_TYPE, type QuickLink } from '@vigilant-broccoli/common-js';
import { PUBLIC_QUICK_LINKS } from '@vigilant-broccoli/public-links';

// Allowlist by label: PUBLIC_QUICK_LINKS is also shared with pastebin and holds project/account-scoped consoles,
// staging hosts and private apps that must never ship as defaults for public visitors.
// The repo's own links (harryliu.dev hosts, vigilant-broccoli repo, demos) are excluded too.
const DEFAULT_BOOKMARK_LABELS = new Set([
  'Cron Guru',
  'GitHub',
  'GitHub Actions Pricing',
  'GitHub Status',
  'Fly.io Docs',
  'AWS Free Tier',
  'Cloudflare Status',
  'Cloudflare R2 Pricing',
  'Cloudflare DNS Docs',
  'Cloudflare Pages Docs',
  'Cloudflare Workers Docs',
  'Cloudflare R2 Storage Docs',
  'Cloudflare Turnstile Docs',
  'OpenWeather API',
  'OpenWeather Pricing',
  'OpenWeather City Search',
  'OpenAI Status',
  'OpenAI Docs',
  'Twilio Status',
  'Twilio Docs',
  'Claude Status',
  'GCP Status',
  'Terraform Status',
  'Stripe Status',
  'Udemy',
]);

// Bookmarks accept only plain browser links, so embed flags are dropped.
export const DEFAULT_BOOKMARKS: QuickLink[] = PUBLIC_QUICK_LINKS.filter(
  link =>
    DEFAULT_BOOKMARK_LABELS.has(link.label) &&
    link.type === OPEN_TYPE.BROWSER &&
    !link.args,
).map(({ label, target, type, subgroup }) => ({
  label,
  target,
  type,
  ...(subgroup ? { subgroup } : {}),
}));
