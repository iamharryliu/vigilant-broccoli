import { OPEN_TYPE, type QuickLink } from '@vigilant-broccoli/common-js';
import {
  VB_APP_URL,
  VB_GITHUB_ACTIONS_URL,
  VB_GITHUB_REPO_URL,
  VB_MONITORING_URL,
} from '@vigilant-broccoli/infrastructure';
import {
  ANTHROPIC_LINK,
  CLAUDE_LINK,
  CLOUDFLARE_LINK,
  DEEPSEEK_LINK,
  ELEVENLABS_LINK,
  FLYIO_LINK,
  GCP_LINK,
  GEMINI_LINK,
  GITHUB_LINK,
  GOOGLE_SERVICES,
  GROK_LINK,
  OPENAI_LINK,
  OPENWEATHER_LINK,
  RENDER_LINK,
  RESEND_LINK,
  ROBOFLOW_LINK,
  STRIPE_LINK,
  TAILSCALE_LINK,
  TERRAFORM_LINK,
  TWILIO_LINK,
} from './vendor.consts';

export const LINK_GROUP_SUBGROUP = {
  UTILITY: 'Utility',
  CAREER: 'Career',
  PERSONAL: 'Personal',
  LEISURE: 'Leisure',
  LEARN: 'Learn',
  FOR_LATER: 'For Later',
  HOME: 'Home',
  DEV: 'Dev',
  VIGILANT_BROCCOLI: 'vigilant-broccoli',
  MESSAGING: 'Messaging',
  UI_APPS: 'UI Apps',
  AGENTIC: 'Agentic',
  WORKFLOWS: 'Workflows',
} as const;

type LinkGroupSubgroup =
  (typeof LINK_GROUP_SUBGROUP)[keyof typeof LINK_GROUP_SUBGROUP];

export const toQuickLinks = (
  subgroup: LinkGroupSubgroup,
  links: readonly { NAME: string; URL: string; EMBED?: boolean }[],
): QuickLink[] =>
  links.map(({ NAME, URL, EMBED }) => ({
    label: NAME,
    target: URL,
    type: OPEN_TYPE.BROWSER,
    ...(EMBED && { embed: true }),
    subgroup,
  }));

export const GENERIC_DEV_LINKS: QuickLink[] = [
  ...toQuickLinks(LINK_GROUP_SUBGROUP.DEV, [
    GCP_LINK.CONSOLE,
    GCP_LINK.COMPUTE,
    GCP_LINK.FIREWALL,
    GCP_LINK.AUTH_AUDIENCE,
    GCP_LINK.CREDENTIALS,
    GOOGLE_SERVICES.ANALYTICS,
    GOOGLE_SERVICES.RECAPTCHA,
    { NAME: 'Cron Guru', URL: 'https://crontab.guru/' },
    GITHUB_LINK.GITHUB,
    GITHUB_LINK.DASHBOARD,
    GITHUB_LINK.TOKENS,
    GITHUB_LINK.APPS,
    GITHUB_LINK.ACTIONS_PRICING,
    GITHUB_LINK.BILLING,
    GITHUB_LINK.PAYMENT_HISTORY,
    GITHUB_LINK.USAGE,
    GITHUB_LINK.STATUS,
    FLYIO_LINK.DASHBOARD,
    FLYIO_LINK.BILLING,
    FLYIO_LINK.DOCS,
    RENDER_LINK.DASHBOARD,
    { NAME: 'AWS Free Tier', URL: 'https://aws.amazon.com/free/' },
    CLOUDFLARE_LINK.STATUS,
    {
      NAME: 'Cloudflare R2 Pricing',
      URL: 'https://developers.cloudflare.com/r2/pricing/',
    },
    CLOUDFLARE_LINK.DNS_DOCS,
    CLOUDFLARE_LINK.PAGES_DOCS,
    CLOUDFLARE_LINK.WORKERS_DOCS,
    CLOUDFLARE_LINK.R2_STORAGE_DOCS,
    CLOUDFLARE_LINK.TURNSTILE_DOCS,
    { NAME: 'OpenWeather API', URL: 'https://openweathermap.org/api' },
    { NAME: 'OpenWeather Pricing', URL: 'https://openweathermap.org/price' },
    { NAME: 'OpenWeather City Search', URL: 'https://openweathermap.org/find' },
    { NAME: 'MongoDB Console', URL: 'https://cloud.mongodb.com/v2/' },
    GOOGLE_SERVICES.ADSENSE,
    { NAME: 'Search Console', URL: 'https://search.google.com/search-console' },
    OPENAI_LINK.DASHBOARD,
    OPENAI_LINK.BILLING,
    OPENAI_LINK.PAYMENT_HISTORY,
    OPENAI_LINK.USAGE,
    OPENAI_LINK.STATUS,
    OPENAI_LINK.DOCS,
    TWILIO_LINK.BILLING,
    TWILIO_LINK.USAGE,
    TWILIO_LINK.STATUS,
    TWILIO_LINK.PHONE_NUMBERS,
    TWILIO_LINK.DOCS,
    CLAUDE_LINK.CODE,
    CLAUDE_LINK.BILLING,
    CLAUDE_LINK.USAGE,
    CLAUDE_LINK.STATUS,
    GCP_LINK.BILLING,
    GCP_LINK.STATUS,
    OPENWEATHER_LINK.DASHBOARD,
    OPENWEATHER_LINK.BILLING,
    OPENWEATHER_LINK.PAYMENT_HISTORY,
    TERRAFORM_LINK.STATUS,
    TERRAFORM_LINK.TOKENS,
    ROBOFLOW_LINK.DASHBOARD,
    DEEPSEEK_LINK.DASHBOARD,
    DEEPSEEK_LINK.BILLING,
    DEEPSEEK_LINK.USAGE,
    GROK_LINK.DASHBOARD,
    GEMINI_LINK.DASHBOARD,
    GEMINI_LINK.API_KEYS,
    GEMINI_LINK.BILLING,
    GEMINI_LINK.USAGE,
    ANTHROPIC_LINK.DASHBOARD,
    ANTHROPIC_LINK.BILLING,
    ANTHROPIC_LINK.PAYMENT_HISTORY,
    ANTHROPIC_LINK.USAGE,
    STRIPE_LINK.DASHBOARD,
    STRIPE_LINK.BILLING,
    STRIPE_LINK.PAYMENT_HISTORY,
    STRIPE_LINK.USAGE,
    STRIPE_LINK.API_MANAGEMENT,
    STRIPE_LINK.STATUS,
    ELEVENLABS_LINK.DASHBOARD,
    ELEVENLABS_LINK.API_KEYS,
    {
      NAME: 'Spotify Developer Dashboard',
      URL: 'https://developer.spotify.com/dashboard',
    },
    RESEND_LINK.DOMAINS,
    RESEND_LINK.EMAILS,
    RESEND_LINK.API_KEYS,
    { NAME: 'Oracle Cloud', URL: 'https://cloud.oracle.com/' },
    {
      NAME: 'Oracle Cloud Auth Tokens',
      URL: 'https://cloud.oracle.com/identity/domains/my-profile/auth-tokens',
    },
    {
      NAME: 'Oracle Cloud Billing',
      URL: 'https://cloud.oracle.com/billing/subscriptions',
    },
    {
      NAME: 'Oracle Cloud Payment History',
      URL: 'https://cloud.oracle.com/invoices-and-orders/upgrade-and-payment',
    },
    {
      NAME: 'Docker Hub Repositories',
      URL: 'https://hub.docker.com/repositories',
    },
    TAILSCALE_LINK.ADMIN,
    TAILSCALE_LINK.KEYS,
    TAILSCALE_LINK.DNS,
    TAILSCALE_LINK.ACLS,
  ]),
];

export const VB_LINKS: QuickLink[] = [
  ...toQuickLinks(LINK_GROUP_SUBGROUP.VIGILANT_BROCCOLI, [
    {
      NAME: 'VB - NPM Packages',
      URL: 'https://www.npmjs.com/settings/vigilant-broccoli/packages',
    },
    { NAME: 'VB - GitHub Repo', URL: VB_GITHUB_REPO_URL },
    { NAME: 'VB - GitHub Actions', URL: VB_GITHUB_ACTIONS_URL },
    { NAME: 'VB - GitHub Pull Requests', URL: `${VB_GITHUB_REPO_URL}/pulls` },
    { NAME: 'VB - GitHub Projects', URL: `${VB_GITHUB_REPO_URL}/projects` },
    VB_APP_URL.PERSONAL_WEBSITE,
    { ...VB_APP_URL.UTILITIES, EMBED: true },
    {
      NAME: `${VB_APP_URL.UTILITIES.NAME} (Staging)`,
      URL: VB_APP_URL.UTILITIES.STAGING_URL,
    },
    VB_APP_URL.WAITING_GAMES,
    {
      NAME: `${VB_APP_URL.WAITING_GAMES.NAME} (Staging)`,
      URL: VB_APP_URL.WAITING_GAMES.STAGING_URL,
    },
    VB_APP_URL.BOOKMARKS,
    {
      NAME: `${VB_APP_URL.BOOKMARKS.NAME} (Staging)`,
      URL: VB_APP_URL.BOOKMARKS.STAGING_URL,
    },
    VB_APP_URL.POMODORO,
    {
      NAME: `${VB_APP_URL.POMODORO.NAME} (Staging)`,
      URL: VB_APP_URL.POMODORO.STAGING_URL,
    },
    VB_APP_URL.CALENDARS,
    {
      NAME: `${VB_APP_URL.CALENDARS.NAME} (Staging)`,
      URL: VB_APP_URL.CALENDARS.STAGING_URL,
    },
    VB_APP_URL.WEATHER,
    {
      NAME: `${VB_APP_URL.WEATHER.NAME} (Staging)`,
      URL: VB_APP_URL.WEATHER.STAGING_URL,
    },
    VB_APP_URL.FIND_ME,
    {
      NAME: `${VB_APP_URL.FIND_ME.NAME} (Staging)`,
      URL: VB_APP_URL.FIND_ME.STAGING_URL,
    },
    VB_APP_URL.WHITEBOARD,
    {
      NAME: `${VB_APP_URL.WHITEBOARD.NAME} (Staging)`,
      URL: VB_APP_URL.WHITEBOARD.STAGING_URL,
    },
    VB_APP_URL.GAMES,
    VB_APP_URL.BALLOONO,
    {
      NAME: `${VB_APP_URL.BALLOONO.NAME} (Staging)`,
      URL: VB_APP_URL.BALLOONO.STAGING_URL,
    },
    VB_APP_URL.GRAVITY_GUY,
    {
      NAME: `${VB_APP_URL.GRAVITY_GUY.NAME} (Staging)`,
      URL: VB_APP_URL.GRAVITY_GUY.STAGING_URL,
    },
    VB_APP_URL.EMPLOYEE_HANDLER_DEMO,
    VB_APP_URL.JOB_HUNT_DEMO,
    VB_APP_URL.OFFICE_PRESENCE_DEMO,
    { ...VB_APP_URL.DOCS, EMBED: true },
    { ...VB_APP_URL.CONTEXT, EMBED: true },
    {
      NAME: `${VB_APP_URL.DOCS.NAME} (Staging)`,
      URL: VB_APP_URL.DOCS.STAGING_URL,
    },
    {
      NAME: `${VB_APP_URL.CONTEXT.NAME} (Staging)`,
      URL: VB_APP_URL.CONTEXT.STAGING_URL,
    },
    {
      NAME: `${VB_APP_URL.PERSONAL_WEBSITE.NAME} (Staging)`,
      URL: VB_APP_URL.PERSONAL_WEBSITE.STAGING_URL,
    },
    { ...VB_APP_URL.RESUME, EMBED: true },
    {
      NAME: `${VB_APP_URL.RESUME.NAME} (Staging)`,
      URL: VB_APP_URL.RESUME.STAGING_URL,
    },
    VB_APP_URL.CLOUD_8_SKATE,
    {
      NAME: `${VB_APP_URL.CLOUD_8_SKATE.NAME} (Staging)`,
      URL: VB_APP_URL.CLOUD_8_SKATE.STAGING_URL,
    },
    VB_APP_URL.HEARTH,
    {
      NAME: `${VB_APP_URL.HEARTH.NAME} (Staging)`,
      URL: VB_APP_URL.HEARTH.STAGING_URL,
    },
    VB_APP_URL.SERVICE_MANAGER,
    {
      NAME: `${VB_APP_URL.SERVICE_MANAGER.NAME} (Staging)`,
      URL: VB_APP_URL.SERVICE_MANAGER.STAGING_URL,
    },
    VB_APP_URL.MEDIA_SERVICE,
    {
      NAME: `${VB_APP_URL.MEDIA_SERVICE.NAME} (Staging)`,
      URL: VB_APP_URL.MEDIA_SERVICE.STAGING_URL,
    },
    VB_MONITORING_URL.NX_CACHE,
    VB_MONITORING_URL.LOKI,
    VB_MONITORING_URL.SOCKET_SERVER,
    VB_APP_URL.CAREER,
  ]),
  {
    label: VB_MONITORING_URL.DEPLOYMENTS.NAME,
    target: VB_MONITORING_URL.DEPLOYMENTS.URL,
    type: OPEN_TYPE.BROWSER,
    embed: true,
    subgroup: LINK_GROUP_SUBGROUP.VIGILANT_BROCCOLI,
  },
  {
    label: VB_MONITORING_URL.STATUS.NAME,
    target: VB_MONITORING_URL.STATUS.URL,
    type: OPEN_TYPE.BROWSER,
    embed: true,
    subgroup: LINK_GROUP_SUBGROUP.VIGILANT_BROCCOLI,
  },
  {
    label: VB_MONITORING_URL.UPTIME.NAME,
    target: VB_MONITORING_URL.UPTIME.URL,
    type: OPEN_TYPE.BROWSER,
    embed: true,
    subgroup: LINK_GROUP_SUBGROUP.VIGILANT_BROCCOLI,
  },
  ...toQuickLinks(LINK_GROUP_SUBGROUP.VIGILANT_BROCCOLI, [
    { NAME: 'Grafana (Cloud)', URL: 'https://grafana.harryliu.dev/' },
  ]),
];

export const LEARN_LINKS: QuickLink[] = [
  ...toQuickLinks(LINK_GROUP_SUBGROUP.LEARN, [
    { NAME: 'Udemy', URL: 'https://www.udemy.com/' },
    { NAME: 'Memrise', URL: 'https://app.memrise.com/dashboard' },
    {
      NAME: 'Memrise (Community Version)',
      URL: 'https://community-courses.memrise.com/dashboard',
    },
  ]),
];

export const UI_APP_LINKS: QuickLink[] = [
  ...toQuickLinks(LINK_GROUP_SUBGROUP.UI_APPS, [
    VB_APP_URL.COMPONENT_LIBRARY,
    {
      NAME: `${VB_APP_URL.COMPONENT_LIBRARY.NAME} (Staging)`,
      URL: VB_APP_URL.COMPONENT_LIBRARY.STAGING_URL,
    },
  ]),
];

// Safe for public bundles: no account ids, personal accounts or local paths.
export const PUBLIC_QUICK_LINKS: QuickLink[] = [
  ...UI_APP_LINKS,
  ...VB_LINKS,
  ...GENERIC_DEV_LINKS,
  ...LEARN_LINKS,
];
