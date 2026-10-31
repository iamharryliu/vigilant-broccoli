import { OPEN_TYPE, type QuickLink } from '@vigilant-broccoli/common-js';
import {
  CLAUDE_LINK,
  GENERIC_DEV_LINKS,
  GOOGLE_SERVICES,
  GROK_LINK,
  LEARN_LINKS,
  LINK_GROUP_SUBGROUP,
  MAC_OS_APP,
  OPENAI_LINK,
  PERSONAL_SITE_LINK,
  PROTON_LINK,
  UI_APP_LINKS,
  UTILITY_URL,
  VB_LINKS,
  toQuickLinks,
} from '@vigilant-broccoli/public-links';
import { EMAIL_LINK, PROJECT_LINK, SOCIAL_LINK } from '@harry/personal';
import {
  CLOUDFLARE_ACCOUNT_LINK,
  FLYIO_ACCOUNT_LINK,
  GCP_PROJECT_LINK,
  LOCAL_HOST_URL,
  NPM_USER_LINK,
  RENDER_ACCOUNT_LINK,
  ROBOFLOW_WORKSPACE_LINK,
  SANITY_ORG_LINK,
  SLACK_WORKSPACE_LINK,
  SUPABASE_PROJECT_LINK,
  TERRAFORM_ORG_LINK,
} from '@vigilant-broccoli/private-infrastructure';
import { ACCESS_GATED_URL } from './access-gated.consts';
import { PERSONAL_ACCOUNT_LINK, PERSONAL_URL } from './personal-account.consts';
import { JOURNAL_PATH, VB_REPO_PATH } from '@harry/private';
import { VB_GITHUB_WORKFLOWS_URL } from '@vigilant-broccoli/infrastructure';
import {
  AGENTIC_PHASES,
  DISPATCHABLE_WORKFLOW_NAMES,
} from './agentic-workflows';

const DEV_LINKS: QuickLink[] = [
  ...toQuickLinks(LINK_GROUP_SUBGROUP.DEV, [
    GCP_PROJECT_LINK.BILLING,
    GCP_PROJECT_LINK.COMPUTE_INSTANCES,
    NPM_USER_LINK.PACKAGES,
    NPM_USER_LINK.TOKENS,
    FLYIO_ACCOUNT_LINK.USAGE,
    FLYIO_ACCOUNT_LINK.STATUS,
    RENDER_ACCOUNT_LINK.BILLING,
    RENDER_ACCOUNT_LINK.SETTINGS,
    CLOUDFLARE_ACCOUNT_LINK.DASHBOARD,
    CLOUDFLARE_ACCOUNT_LINK.BILLING,
    CLOUDFLARE_ACCOUNT_LINK.USAGE,
    SUPABASE_PROJECT_LINK.ORGANIZATION,
    SUPABASE_PROJECT_LINK.PROJECT,
    SUPABASE_PROJECT_LINK.AUTH_URL_CONFIGURATION,
    CLOUDFLARE_ACCOUNT_LINK.DOMAINS,
    CLOUDFLARE_ACCOUNT_LINK.WORKERS_AND_PAGES,
    CLOUDFLARE_ACCOUNT_LINK.R2_BUCKETS,
    GCP_PROJECT_LINK.DASHBOARD,
    TERRAFORM_ORG_LINK.DASHBOARD,
    TERRAFORM_ORG_LINK.BILLING,
    TERRAFORM_ORG_LINK.USAGE,
    ROBOFLOW_WORKSPACE_LINK.BILLING,
    ROBOFLOW_WORKSPACE_LINK.USAGE,
    SANITY_ORG_LINK.APPLICATIONS,
  ]),
  ...toQuickLinks(LINK_GROUP_SUBGROUP.UTILITY, Object.values(LOCAL_HOST_URL)),
  ...toQuickLinks(LINK_GROUP_SUBGROUP.VIGILANT_BROCCOLI, [
    ...Object.values(ACCESS_GATED_URL),
    {
      NAME: `${ACCESS_GATED_URL.MOBILE_MANAGER_NEXT.NAME} (Staging)`,
      URL: ACCESS_GATED_URL.MOBILE_MANAGER_NEXT.STAGING_URL,
    },
  ]),
];

const UTILITY_LINKS: QuickLink[] = [
  {
    label: MAC_OS_APP.CHROME.NAME,
    target: MAC_OS_APP.CHROME.NAME,
    type: OPEN_TYPE.MAC_APPLICATION,
    subgroup: LINK_GROUP_SUBGROUP.UTILITY,
  },
  {
    label: MAC_OS_APP.FIREFOX.NAME,
    target: MAC_OS_APP.FIREFOX.NAME,
    type: OPEN_TYPE.MAC_APPLICATION,
    subgroup: LINK_GROUP_SUBGROUP.UTILITY,
  },
  ...toQuickLinks(LINK_GROUP_SUBGROUP.UTILITY, [UTILITY_URL.CHROME_EXTENSIONS]),
  {
    label: MAC_OS_APP.SLACK.NAME,
    target: MAC_OS_APP.SLACK.NAME,
    type: OPEN_TYPE.MAC_APPLICATION,
    subgroup: LINK_GROUP_SUBGROUP.UTILITY,
  },
  ...toQuickLinks(LINK_GROUP_SUBGROUP.UTILITY, [
    { NAME: 'Slack Browser', URL: UTILITY_URL.SLACK.URL },
    SLACK_WORKSPACE_LINK.OK_IN_SLACK_DEMO,
    UTILITY_URL.SLACK_API_APPS,
  ]),
  {
    label: 'Bitwarden',
    target: 'Bitwarden',
    type: OPEN_TYPE.MAC_APPLICATION,
    subgroup: LINK_GROUP_SUBGROUP.UTILITY,
  },
  {
    label: 'Google Password Manager',
    target: MAC_OS_APP.CHROME.NAME,
    args: 'chrome://password-manager/settings',
    type: OPEN_TYPE.MAC_APPLICATION,
    subgroup: LINK_GROUP_SUBGROUP.UTILITY,
  },
  {
    label: 'Apple Password Manager',
    target: 'Passwords',
    type: OPEN_TYPE.MAC_APPLICATION,
    subgroup: LINK_GROUP_SUBGROUP.UTILITY,
  },
  ...toQuickLinks(LINK_GROUP_SUBGROUP.UTILITY, [
    { NAME: 'Speedtest', URL: 'https://www.speedtest.net/' },
    PERSONAL_ACCOUNT_LINK.KARMANOW,
    { NAME: 'QR Code Generator', URL: 'https://www.qr-code-generator.com/' },
    { NAME: 'TinyURL', URL: 'https://tinyurl.com/' },
    PERSONAL_ACCOUNT_LINK.FREEDOM_USAGE,
    PERSONAL_ACCOUNT_LINK.PRESTO,
    PERSONAL_ACCOUNT_LINK.TD_EASYWEB,
    PERSONAL_ACCOUNT_LINK.QUESTRADE,
    {
      NAME: 'TFSA Room Calculator',
      URL: 'https://www.moneysense.ca/save/investing/tfsa-contribution-room-calculator/',
    },
    PERSONAL_ACCOUNT_LINK.NEO_FINANCIAL,
    PERSONAL_ACCOUNT_LINK.MBNA,
    PERSONAL_ACCOUNT_LINK.CT_TRIANGLE,
    PERSONAL_ACCOUNT_LINK.HOME_DEPOT,
    GOOGLE_SERVICES.GMAIL,
    GOOGLE_SERVICES.GMAIL.FILTERS,
    GOOGLE_SERVICES.GMAIL.SIGNATURE,
    PROTON_LINK.MAIL,
    PROTON_LINK.CALENDAR,
    PROTON_LINK.DRIVE,
    PROTON_LINK.PASS,
    PROTON_LINK.ACCOUNT,
    GOOGLE_SERVICES.CALENDAR,
    GOOGLE_SERVICES.MEET,
    UTILITY_URL.AMAZON,
    GOOGLE_SERVICES.YOUTUBE,
    UTILITY_URL.PINTEREST,
    GOOGLE_SERVICES.PHOTOS,
    GOOGLE_SERVICES.CONTACTS,
    GOOGLE_SERVICES.DRIVE,
    GOOGLE_SERVICES.KEEP,
    GOOGLE_SERVICES.TASKS,
    GOOGLE_SERVICES.MAPS,
    GOOGLE_SERVICES.TRANSLATE,
    GOOGLE_SERVICES.STORAGE,
    { NAME: 'OpenL Bulk Translator', URL: 'https://openl.io/bulk-translator' },
    OPENAI_LINK.CHATGPT,
    OPENAI_LINK.INCOGNITO,
    CLAUDE_LINK.CLAUDE,
    CLAUDE_LINK.INCOGNITO,
    CLAUDE_LINK.PRICING,
    GOOGLE_SERVICES.GEMINI,
    GROK_LINK.GROK,
    UTILITY_URL.FIND_MY,
    UTILITY_URL.APPLE_STORAGE,
    {
      NAME: 'Google App Passwords',
      URL: 'https://myaccount.google.com/apppasswords',
    },
    UTILITY_URL.MALMO_BY_BIKE,
  ]),
];

const PERSONAL_LINKS: QuickLink[] = [
  ...toQuickLinks(LINK_GROUP_SUBGROUP.PERSONAL, [
    { NAME: 'Personal Website', URL: PERSONAL_SITE_LINK.INDEX.URL },
    PERSONAL_SITE_LINK.LINKS,
    PERSONAL_SITE_LINK.CONTACT,
    EMAIL_LINK,
    SOCIAL_LINK.GITHUB,
    { ...PROJECT_LINK.SOFTWARE_PROJECTS, EMBED: true },
    SOCIAL_LINK.INSTAGRAM_PRETTYDAMNTIRED,
  ]),
];

const CAREER_LINKS: QuickLink[] = [
  ...toQuickLinks(LINK_GROUP_SUBGROUP.CAREER, [
    { NAME: 'LinkedIn Profile', URL: SOCIAL_LINK.LINKEDIN.URL },
    { ...PERSONAL_SITE_LINK.RESUME, EMBED: true },
    { NAME: 'LinkedIn', URL: 'https://www.linkedin.com' },
  ]),
];

const MESSAGING_LINKS: QuickLink[] = [
  {
    label: 'Messages',
    target: MAC_OS_APP.MESSAGES.NAME,
    type: OPEN_TYPE.MAC_APPLICATION,
    subgroup: LINK_GROUP_SUBGROUP.MESSAGING,
  },
  ...toQuickLinks(LINK_GROUP_SUBGROUP.MESSAGING, [
    {
      NAME: 'Instagram Messenger',
      URL: 'https://www.instagram.com/direct/inbox/',
    },
    { NAME: 'Facebook Messenger', URL: 'https://www.messenger.com/' },
  ]),
  {
    label: 'WhatsApp',
    target: MAC_OS_APP.WHATSAPP.NAME,
    type: OPEN_TYPE.MAC_APPLICATION,
    subgroup: LINK_GROUP_SUBGROUP.MESSAGING,
  },
];

const LEISURE_LINKS: QuickLink[] = [
  {
    label: MAC_OS_APP.SPOTIFY.NAME,
    target: MAC_OS_APP.SPOTIFY.NAME,
    type: OPEN_TYPE.MAC_APPLICATION,
    subgroup: LINK_GROUP_SUBGROUP.LEISURE,
  },
  ...toQuickLinks(LINK_GROUP_SUBGROUP.LEISURE, [
    { NAME: 'Manga', URL: 'https://ww2.mangafreak.me/' },
    PERSONAL_URL.TO_DRAW,
    PERSONAL_URL.TO_READ,
    PERSONAL_URL.TO_WATCH_ANIME,
    PERSONAL_URL.TO_WATCH_MOVIES_SHOWS,
  ]),
];

const FOR_LATER_LINKS: QuickLink[] = [
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
  ...toQuickLinks(LINK_GROUP_SUBGROUP.FOR_LATER, [
    GOOGLE_SERVICES.YOUTUBE.WATCH_LATER,
    PERSONAL_URL.INSTAGRAM_SAVED,
    PERSONAL_URL.REDDIT_SAVED,
  ]),
  {
    label: 'Expiration',
    target: JOURNAL_PATH.EXPIRATION,
    type: OPEN_TYPE.VSCODE,
    subgroup: LINK_GROUP_SUBGROUP.FOR_LATER,
  },
];

const HOME_LINKS: QuickLink[] = [
  {
    label: 'Food',
    target: JOURNAL_PATH.FOOD,
    type: OPEN_TYPE.VSCODE,
    subgroup: LINK_GROUP_SUBGROUP.HOME,
  },
  ...toQuickLinks(LINK_GROUP_SUBGROUP.HOME, [PERSONAL_URL.GROCERIES]),
];

const AGENTIC_LINKS: QuickLink[] = AGENTIC_PHASES.flatMap(({ workflows }) =>
  workflows.map(({ name, url }) => ({
    label: name,
    target: url,
    type: OPEN_TYPE.BROWSER,
    subgroup: LINK_GROUP_SUBGROUP.AGENTIC,
  })),
);

const AGENTIC_URLS = new Set(
  AGENTIC_PHASES.flatMap(({ workflows }) => workflows.map(({ url }) => url)),
);

const WORKFLOW_LINKS: QuickLink[] = DISPATCHABLE_WORKFLOW_NAMES.map(name => ({
  label: name,
  target: `${VB_GITHUB_WORKFLOWS_URL}/${name}.yml`,
  type: OPEN_TYPE.BROWSER,
  subgroup: LINK_GROUP_SUBGROUP.WORKFLOWS,
})).filter(({ target }) => !AGENTIC_URLS.has(target));

export type { QuickLink };

export const EXTERNAL_QUICK_LINKS: QuickLink[] = [
  ...UI_APP_LINKS,
  ...VB_LINKS,
  ...AGENTIC_LINKS,
  ...WORKFLOW_LINKS,
  ...GENERIC_DEV_LINKS,
  ...DEV_LINKS,
  ...UTILITY_LINKS,
  ...PERSONAL_LINKS,
  ...CAREER_LINKS,
  ...MESSAGING_LINKS,
  ...LEISURE_LINKS,
  ...LEARN_LINKS,
  ...FOR_LATER_LINKS,
  ...HOME_LINKS,
];
