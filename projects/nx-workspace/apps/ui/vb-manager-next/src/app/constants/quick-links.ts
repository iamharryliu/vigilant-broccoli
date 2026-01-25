import { OPEN_TYPE } from '@vigilant-broccoli/common-js';
import {
  GOOGLE_SERVICES,
  UTILITY_URL,
} from '@vigilant-broccoli/common-js';
import {
  JOURNAL_PATH,
  MAC_OS_APP,
  PERSONAL_URL,
  VB_REPO_PATH,
} from '@vigilant-broccoli/personal-common-js';

const LINK_GROUP_SUBGROUP = {
  UTILITY: 'Utility',
  CAREER: 'Career',
  LEISURE: 'Leisure',
  LEARN: 'Learn',
  FOR_LATER: 'For Later',
  HOME: 'Home',
  DEV: 'Dev',
  VIGILANT_BROCCOLI: 'vigilant-broccoli',
} as const;

const DEV_LINKS = [
  {
    label: 'GCP',
    target: 'https://console.cloud.google.com',
    type: OPEN_TYPE.BROWSER,
    subgroup: LINK_GROUP_SUBGROUP.DEV,
  },
  {
    label: 'VB - GCP Billing',
    target: 'https://console.cloud.google.com/billing/017A09-73DEB3-7A8E42/reports?inv=1&invt=Ab2jMQ&project=vigilant-broccoli',
    type: OPEN_TYPE.BROWSER,
    subgroup: LINK_GROUP_SUBGROUP.DEV,
  },
  {
    label: 'VB - GCE Instances',
    target: 'https://console.cloud.google.com/compute/instances?inv=1&invt=Ab2jIQ&project=vigilant-broccoli',
    type: OPEN_TYPE.BROWSER,
    subgroup: LINK_GROUP_SUBGROUP.DEV,
  },
  {
    label: 'Cron Guru',
    target: 'https://crontab.guru/',
    type: OPEN_TYPE.BROWSER,
    subgroup: LINK_GROUP_SUBGROUP.DEV,
  },
  {
    label: 'GitHub',
    target: 'https://github.com',
    type: OPEN_TYPE.BROWSER,
    subgroup: LINK_GROUP_SUBGROUP.DEV,
  },
  {
    label: 'GitHub Tokens',
    target: 'https://github.com/settings/personal-access-tokens',
    type: OPEN_TYPE.BROWSER,
    subgroup: LINK_GROUP_SUBGROUP.DEV,
  },
  {
    label: 'GitHub Actions Pricing',
    target: 'https://docs.github.com/en/billing/managing-billing-for-your-products/about-billing-for-github-actions',
    type: OPEN_TYPE.BROWSER,
    subgroup: LINK_GROUP_SUBGROUP.DEV,
  },
  {
    label: 'GitHub Billing',
    target: 'https://github.com/settings/billing',
    type: OPEN_TYPE.BROWSER,
    subgroup: LINK_GROUP_SUBGROUP.DEV,
  },
  {
    label: 'VB - NPM Packages (prettydamntired)',
    target: 'https://www.npmjs.com/settings/prettydamntired/packages',
    type: OPEN_TYPE.BROWSER,
    subgroup: LINK_GROUP_SUBGROUP.DEV,
  },
  {
    label: 'FlyIO Dashboard',
    target: 'https://fly.io/dashboard',
    type: OPEN_TYPE.BROWSER,
    subgroup: LINK_GROUP_SUBGROUP.DEV,
  },
  {
    label: 'FlyIO Billing',
    target: 'https://fly.io/dashboard/personal/billing',
    type: OPEN_TYPE.BROWSER,
    subgroup: LINK_GROUP_SUBGROUP.DEV,
  },
  {
    label: 'VB - FlyIO reCAPTCHA',
    target: 'https://www.google.com/recaptcha/admin/site/682849728',
    type: OPEN_TYPE.BROWSER,
    subgroup: LINK_GROUP_SUBGROUP.DEV,
  },
  {
    label: 'AWS Free Tier',
    target: 'https://aws.amazon.com/free/',
    type: OPEN_TYPE.BROWSER,
    subgroup: LINK_GROUP_SUBGROUP.DEV,
  },
  {
    label: 'VB - Cloudflare Billing',
    target: 'https://dash.cloudflare.com/26d066ec62c4d27b8da5e9aebac17293/billing',
    type: OPEN_TYPE.BROWSER,
    subgroup: LINK_GROUP_SUBGROUP.DEV,
  },
  {
    label: 'VB - Cloudflare Domains',
    target: 'https://dash.cloudflare.com/26d066ec62c4d27b8da5e9aebac17293/registrar/domains',
    type: OPEN_TYPE.BROWSER,
    subgroup: LINK_GROUP_SUBGROUP.DEV,
  },
  {
    label: 'VB - Cloudflare Workers',
    target: 'https://dash.cloudflare.com/26d066ec62c4d27b8da5e9aebac17293/workers-and-pages',
    type: OPEN_TYPE.BROWSER,
    subgroup: LINK_GROUP_SUBGROUP.DEV,
  },
  {
    label: 'Cloudflare R2 Pricing',
    target: 'https://developers.cloudflare.com/r2/pricing/',
    type: OPEN_TYPE.BROWSER,
    subgroup: LINK_GROUP_SUBGROUP.DEV,
  },
  {
    label: 'VB - Cloudflare R2 Buckets',
    target: 'https://dash.cloudflare.com/26d066ec62c4d27b8da5e9aebac17293/r2/overview',
    type: OPEN_TYPE.BROWSER,
    subgroup: LINK_GROUP_SUBGROUP.DEV,
  },
  {
    label: 'OpenWeather API',
    target: 'https://openweathermap.org/api',
    type: OPEN_TYPE.BROWSER,
    subgroup: LINK_GROUP_SUBGROUP.DEV,
  },
  {
    label: 'OpenWeather Pricing',
    target: 'https://openweathermap.org/price',
    type: OPEN_TYPE.BROWSER,
    subgroup: LINK_GROUP_SUBGROUP.DEV,
  },
  {
    label: 'OpenWeather City Search',
    target: 'https://openweathermap.org/find',
    type: OPEN_TYPE.BROWSER,
    subgroup: LINK_GROUP_SUBGROUP.DEV,
  },
  {
    label: 'MongoDB Console',
    target: 'https://cloud.mongodb.com/v2/',
    type: OPEN_TYPE.BROWSER,
    subgroup: LINK_GROUP_SUBGROUP.DEV,
  },
  {
    label: 'Google AdSense',
    target: 'https://adsense.google.com/start/',
    type: OPEN_TYPE.BROWSER,
    subgroup: LINK_GROUP_SUBGROUP.DEV,
  },
  {
    label: 'Google Analytics',
    target: 'https://analytics.google.com/analytics/',
    type: OPEN_TYPE.BROWSER,
    subgroup: LINK_GROUP_SUBGROUP.DEV,
  },
  {
    label: 'reCAPTCHA Admin',
    target: 'https://www.google.com/recaptcha/admin/',
    type: OPEN_TYPE.BROWSER,
    subgroup: LINK_GROUP_SUBGROUP.DEV,
  },
  {
    label: 'OpenAI Billing',
    target: 'https://platform.openai.com/settings/organization/billing/overview',
    type: OPEN_TYPE.BROWSER,
    subgroup: LINK_GROUP_SUBGROUP.DEV,
  },
  {
    label: 'OpenAI Docs',
    target: 'https://platform.openai.com/docs/overview',
    type: OPEN_TYPE.BROWSER,
    subgroup: LINK_GROUP_SUBGROUP.DEV,
  },
  {
    label: 'Twilio Billing',
    target: 'https://console.twilio.com/us1/billing/manage-billing/billing-overview',
    type: OPEN_TYPE.BROWSER,
    subgroup: LINK_GROUP_SUBGROUP.DEV,
  },
];

const VB_LINKS = [
  {
    label: 'VB - NPM Packages',
    target: 'https://www.npmjs.com/settings/vigilant-broccoli/packages',
    type: OPEN_TYPE.BROWSER,
    subgroup: LINK_GROUP_SUBGROUP.VIGILANT_BROCCOLI,
  },
  {
    label: 'VB - GitHub Repo',
    target: 'https://github.com/iamharryliu/vigilant-broccoli',
    type: OPEN_TYPE.BROWSER,
    subgroup: LINK_GROUP_SUBGROUP.VIGILANT_BROCCOLI,
  },
  {
    label: 'VB - GitHub Actions',
    target: 'https://github.com/iamharryliu/vigilant-broccoli/actions',
    type: OPEN_TYPE.BROWSER,
    subgroup: LINK_GROUP_SUBGROUP.VIGILANT_BROCCOLI,
  },
  {
    label: 'VB - GCP API Credentials',
    target:
      'https://console.cloud.google.com/apis/credentials?project=vigilant-broccoli',
    type: OPEN_TYPE.BROWSER,
    subgroup: LINK_GROUP_SUBGROUP.VIGILANT_BROCCOLI,
  },
];

const UTILITY_LINKS = [
  {
    label: MAC_OS_APP.SLACK.NAME,
    target: MAC_OS_APP.SLACK.NAME,
    type: OPEN_TYPE.MAC_APPLICATION,
    subgroup: LINK_GROUP_SUBGROUP.UTILITY,
  },
  {
    label: GOOGLE_SERVICES.GMAIL.NAME,
    target: GOOGLE_SERVICES.GMAIL.URL,
    type: OPEN_TYPE.BROWSER,
    subgroup: LINK_GROUP_SUBGROUP.UTILITY,
  },
  {
    label: GOOGLE_SERVICES.CALENDAR.NAME,
    target: GOOGLE_SERVICES.CALENDAR.URL,
    type: OPEN_TYPE.BROWSER,
    subgroup: LINK_GROUP_SUBGROUP.UTILITY,
  },
  {
    label: GOOGLE_SERVICES.MEET.NAME,
    target: GOOGLE_SERVICES.MEET.URL,
    type: OPEN_TYPE.BROWSER,
    subgroup: LINK_GROUP_SUBGROUP.UTILITY,
  },
  {
    label: UTILITY_URL.AMAZON.NAME,
    target: UTILITY_URL.AMAZON.URL,
    type: OPEN_TYPE.BROWSER,
    subgroup: LINK_GROUP_SUBGROUP.UTILITY,
  },
  {
    label: GOOGLE_SERVICES.YOUTUBE.NAME,
    target: GOOGLE_SERVICES.YOUTUBE.URL,
    type: OPEN_TYPE.BROWSER,
    subgroup: LINK_GROUP_SUBGROUP.UTILITY,
  },
  {
    label: UTILITY_URL.PINTEREST.NAME,
    target: UTILITY_URL.PINTEREST.URL,
    type: OPEN_TYPE.BROWSER,
    subgroup: LINK_GROUP_SUBGROUP.UTILITY,
  },
  {
    label: GOOGLE_SERVICES.PHOTOS.NAME,
    target: GOOGLE_SERVICES.PHOTOS.URL,
    type: OPEN_TYPE.BROWSER,
    subgroup: LINK_GROUP_SUBGROUP.UTILITY,
  },
  {
    label: GOOGLE_SERVICES.CONTACTS.NAME,
    target: GOOGLE_SERVICES.CONTACTS.URL,
    type: OPEN_TYPE.BROWSER,
    subgroup: LINK_GROUP_SUBGROUP.UTILITY,
  },
  {
    label: GOOGLE_SERVICES.DRIVE.NAME,
    target: GOOGLE_SERVICES.DRIVE.URL,
    type: OPEN_TYPE.BROWSER,
    subgroup: LINK_GROUP_SUBGROUP.UTILITY,
  },
  {
    label: 'Google Keep',
    target: 'https://keep.google.com/',
    type: OPEN_TYPE.BROWSER,
    subgroup: LINK_GROUP_SUBGROUP.UTILITY,
  },
  {
    label: 'Google Tasks',
    target: 'https://tasks.google.com/',
    type: OPEN_TYPE.BROWSER,
    subgroup: LINK_GROUP_SUBGROUP.UTILITY,
  },
  {
    label: GOOGLE_SERVICES.MAPS.NAME,
    target: GOOGLE_SERVICES.MAPS.URL,
    type: OPEN_TYPE.BROWSER,
    subgroup: LINK_GROUP_SUBGROUP.UTILITY,
  },
  {
    label: GOOGLE_SERVICES.TRANSLATE.NAME,
    target: GOOGLE_SERVICES.TRANSLATE.URL,
    type: OPEN_TYPE.BROWSER,
    subgroup: LINK_GROUP_SUBGROUP.UTILITY,
  },
  {
    label: UTILITY_URL.CHATGPT.NAME,
    target: UTILITY_URL.CHATGPT.URL,
    type: OPEN_TYPE.BROWSER,
    subgroup: LINK_GROUP_SUBGROUP.UTILITY,
  },
  {
    label: 'ChatGPT Incognito',
    target: 'https://chatgpt.com/?temporary-chat=true',
    type: OPEN_TYPE.BROWSER,
    subgroup: LINK_GROUP_SUBGROUP.UTILITY,
  },
  {
    label: UTILITY_URL.CLAUDE.NAME,
    target: UTILITY_URL.CLAUDE.URL,
    type: OPEN_TYPE.BROWSER,
    subgroup: LINK_GROUP_SUBGROUP.UTILITY,
  },
  {
    label: 'Claude Incognito',
    target: 'https://claude.ai/new?incognito',
    type: OPEN_TYPE.BROWSER,
    subgroup: LINK_GROUP_SUBGROUP.UTILITY,
  },
  {
    label: 'Gemini',
    target: 'https://gemini.google.com/app',
    type: OPEN_TYPE.BROWSER,
    subgroup: LINK_GROUP_SUBGROUP.UTILITY,
  },
  {
    label: UTILITY_URL.FIND_MY.NAME,
    target: UTILITY_URL.FIND_MY.URL,
    type: OPEN_TYPE.BROWSER,
    subgroup: LINK_GROUP_SUBGROUP.UTILITY,
  },
];

const CAREER_LINKS = [
  {
    label: PERSONAL_URL.RESUME.NAME,
    target: PERSONAL_URL.RESUME.URL,
    type: OPEN_TYPE.BROWSER,
    subgroup: LINK_GROUP_SUBGROUP.CAREER,
  },
  {
    label: 'LinkedIn',
    target: 'https://www.linkedin.com',
    type: OPEN_TYPE.BROWSER,
    subgroup: LINK_GROUP_SUBGROUP.CAREER,
  },
];

const LEISURE_LINKS = [
  {
    label: MAC_OS_APP.SPOTIFY.NAME,
    target: MAC_OS_APP.SPOTIFY.NAME,
    type: OPEN_TYPE.MAC_APPLICATION,
    subgroup: LINK_GROUP_SUBGROUP.LEISURE,
  },
  {
    label: 'Manga',
    target: ' https://ww2.mangafreak.me/',
    type: OPEN_TYPE.BROWSER,
    subgroup: LINK_GROUP_SUBGROUP.LEISURE,
  },
  {
    label: PERSONAL_URL.TO_DRAW.NAME,
    target: PERSONAL_URL.TO_DRAW.URL,
    type: OPEN_TYPE.BROWSER,
    subgroup: LINK_GROUP_SUBGROUP.LEISURE,
  },
  {
    label: PERSONAL_URL.TO_READ.NAME,
    target: PERSONAL_URL.TO_READ.URL,
    type: OPEN_TYPE.BROWSER,
    subgroup: LINK_GROUP_SUBGROUP.LEISURE,
  },
  {
    label: PERSONAL_URL.TO_WATCH_ANIME.NAME,
    target: PERSONAL_URL.TO_WATCH_ANIME.URL,
    type: OPEN_TYPE.BROWSER,
    subgroup: LINK_GROUP_SUBGROUP.LEISURE,
  },
  {
    label: PERSONAL_URL.TO_WATCH_MOVIES_SHOWS.NAME,
    target: PERSONAL_URL.TO_WATCH_MOVIES_SHOWS.URL,
    type: OPEN_TYPE.BROWSER,
    subgroup: LINK_GROUP_SUBGROUP.LEISURE,
  },
];

const LEARN_LINKS = [
  {
    label: 'Udemy',
    target: 'https://www.udemy.com/',
    type: OPEN_TYPE.BROWSER,
    subgroup: LINK_GROUP_SUBGROUP.LEARN,
  },
  {
    label: 'Memrise',
    target: 'https://app.memrise.com/dashboard',
    type: OPEN_TYPE.BROWSER,
    subgroup: LINK_GROUP_SUBGROUP.LEARN,
  },
  {
    label: 'Memrise (Community Version)',
    target: 'https://community-courses.memrise.com/dashboard',
    type: OPEN_TYPE.BROWSER,
    subgroup: LINK_GROUP_SUBGROUP.LEARN,
  },
];

const FOR_LATER_LINKS = [
  {
    label: 'TODO(Journal)',
    target: JOURNAL_PATH.TODO,
    type: OPEN_TYPE.VSCODE,
    subgroup: LINK_GROUP_SUBGROUP.FOR_LATER,
  },
  {
    label: 'TODO(vigilant-broccoli)',
    target: VB_REPO_PATH.TODO,
    type: OPEN_TYPE.VSCODE,
    subgroup: LINK_GROUP_SUBGROUP.FOR_LATER,
  },
  {
    label: 'YouTube Watch Later',
    target: 'https://www.youtube.com/playlist?list=WL',
    type: OPEN_TYPE.BROWSER,
    subgroup: LINK_GROUP_SUBGROUP.FOR_LATER,
  },
  {
    label: PERSONAL_URL.INSTAGRAM_SAVED.NAME,
    target: PERSONAL_URL.INSTAGRAM_SAVED.URL,
    type: OPEN_TYPE.BROWSER,
    subgroup: LINK_GROUP_SUBGROUP.FOR_LATER,
  },
  {
    label: PERSONAL_URL.REDDIT_SAVED.NAME,
    target: PERSONAL_URL.REDDIT_SAVED.URL,
    type: OPEN_TYPE.BROWSER,
    subgroup: LINK_GROUP_SUBGROUP.FOR_LATER,
  },
  {
    label: 'Expiration',
    target: JOURNAL_PATH.EXPIRATION,
    type: OPEN_TYPE.VSCODE,
    subgroup: LINK_GROUP_SUBGROUP.FOR_LATER,
  },
];

const HOME_LINKS = [
  {
    label: 'Food',
    target: JOURNAL_PATH.FOOD,
    type: OPEN_TYPE.VSCODE,
    subgroup: LINK_GROUP_SUBGROUP.HOME,
  },
  {
    label: PERSONAL_URL.GROCERIES.NAME,
    target: PERSONAL_URL.GROCERIES.URL,
    type: OPEN_TYPE.BROWSER,
    subgroup: LINK_GROUP_SUBGROUP.HOME,
  },
  {
    label: PERSONAL_URL.HOME_PROJECTS.NAME,
    target: PERSONAL_URL.HOME_PROJECTS.URL,
    type: OPEN_TYPE.BROWSER,
    subgroup: LINK_GROUP_SUBGROUP.HOME,
  },
  {
    label: PERSONAL_URL.HOME_KITCHEN_INVENTORY.NAME,
    target: PERSONAL_URL.HOME_KITCHEN_INVENTORY.URL,
    type: OPEN_TYPE.BROWSER,
    subgroup: LINK_GROUP_SUBGROUP.HOME,
  },
];

export const QUICK_LINKS = [
  ...VB_LINKS,
  ...DEV_LINKS,
  ...UTILITY_LINKS,
  ...CAREER_LINKS,
  ...LEISURE_LINKS,
  ...LEARN_LINKS,
  ...FOR_LATER_LINKS,
  ...HOME_LINKS,
];
