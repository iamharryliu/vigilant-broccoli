import { type QuickLink } from '@vigilant-broccoli/common-js';
import {
  CLAUDE_LINK,
  GENERIC_DEV_LINKS,
  GOOGLE_SERVICES,
  GROK_LINK,
  LEARN_LINKS,
  LINK_GROUP_SUBGROUP,
  OPENAI_LINK,
  PROTON_LINK,
  UTILITY_URL,
  toQuickLinks,
} from '@vigilant-broccoli/public-links';

// Mirrors the generic links local-manager offers. Excluded on purpose: the repo's own hosts, apps and
// monitoring pages, personal accounts and sites, project-scoped consoles, and non-browser (Mac app,
// chrome://, VS Code) links that a public page cannot open.
const UTILITY_BOOKMARKS: QuickLink[] = toQuickLinks(
  LINK_GROUP_SUBGROUP.UTILITY,
  [
    { NAME: 'Slack Browser', URL: UTILITY_URL.SLACK.URL },
    UTILITY_URL.SLACK_API_APPS,
    { NAME: 'Speedtest', URL: 'https://www.speedtest.net/' },
    { NAME: 'QR Code Generator', URL: 'https://www.qr-code-generator.com/' },
    { NAME: 'TinyURL', URL: 'https://tinyurl.com/' },
    {
      NAME: 'TFSA Room Calculator',
      URL: 'https://www.moneysense.ca/save/investing/tfsa-contribution-room-calculator/',
    },
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
  ],
);

const MESSAGING_BOOKMARKS: QuickLink[] = toQuickLinks(
  LINK_GROUP_SUBGROUP.MESSAGING,
  [
    {
      NAME: 'Instagram Messenger',
      URL: 'https://www.instagram.com/direct/inbox/',
    },
    { NAME: 'Facebook Messenger', URL: 'https://www.messenger.com/' },
  ],
);

const LEISURE_BOOKMARKS: QuickLink[] = [
  ...toQuickLinks(LINK_GROUP_SUBGROUP.LEISURE, [
    { NAME: 'Manga', URL: 'https://ww2.mangafreak.me/' },
  ]),
  ...toQuickLinks(LINK_GROUP_SUBGROUP.FOR_LATER, [
    GOOGLE_SERVICES.YOUTUBE.WATCH_LATER,
  ]),
];

export const DEFAULT_BOOKMARKS: QuickLink[] = [
  ...GENERIC_DEV_LINKS,
  ...UTILITY_BOOKMARKS,
  ...MESSAGING_BOOKMARKS,
  ...LEISURE_BOOKMARKS,
  ...LEARN_LINKS,
];
