import { OPEN_TYPE, type QuickLink } from '@vigilant-broccoli/common-js';
import {
  BUSINESS_LINK,
  COMMUNITY_LINK,
  EMAIL_LINK,
  INTEREST_LINK,
  PROJECT_LINK,
  SOCIAL_LINK,
} from '@harry/personal';
import { VB_APP_URL } from '@vigilant-broccoli/infrastructure';
import {
  LINK_GROUP_SUBGROUP,
  PUBLIC_QUICK_LINKS,
  toQuickLinks,
} from './quick-links.consts';

export const PERSONAL_SITE_LINK = {
  INDEX: {
    NAME: 'Index',
    URL: VB_APP_URL.PERSONAL_WEBSITE.URL,
  },
  LINKS: {
    NAME: 'Links',
    URL: 'https://harryliu.dev/links',
  },
  CALENDAR: {
    NAME: 'Calendar',
    URL: PROJECT_LINK.CALENDAR.URL,
  },
  CONTACT: {
    NAME: 'Contact',
    URL: 'https://harryliu.dev/contact',
  },
  RESUME: {
    NAME: 'Resume',
    URL: VB_APP_URL.RESUME.URL,
  },
} as const;

export const PERSONAL_QUICK_LINKS: QuickLink[] = [
  ...toQuickLinks(LINK_GROUP_SUBGROUP.PERSONAL, [
    { NAME: 'Personal Website', URL: PERSONAL_SITE_LINK.INDEX.URL },
    PERSONAL_SITE_LINK.LINKS,
    PERSONAL_SITE_LINK.CONTACT,
    EMAIL_LINK,
    SOCIAL_LINK.GITHUB,
    PROJECT_LINK.SOFTWARE_PROJECTS,
    SOCIAL_LINK.INSTAGRAM_PRETTYDAMNTIRED,
  ]),
  ...toQuickLinks(LINK_GROUP_SUBGROUP.CAREER, [
    { NAME: 'LinkedIn Profile', URL: SOCIAL_LINK.LINKEDIN.URL },
    PERSONAL_SITE_LINK.RESUME,
  ]),
];

const ADDRESS_LINK = {
  ADDRESS: {
    NAME: 'Address',
    URL: 'https://maps.app.goo.gl/E6q6Bnau5dA8AgU4A',
  },
} as const;

const PASTEBIN_GROUP_NAME = {
  PERSONAL: 'Personal',
  CONTACT: 'Contact',
  ADDRESS: 'Address',
  CAREER: 'Career',
  SOFTWARE: 'Software',
  BUSINESS: 'Business',
  COMMUNITY: 'Community',
  INTERESTS_AND_HOBBIES: 'Interests and Hobbies',
} as const;

const toLinks =
  (subgroup: string) =>
  (links: { NAME: string; URL: string }[]): QuickLink[] =>
    links.map(({ NAME, URL }) => ({
      label: NAME,
      target: URL,
      type: OPEN_TYPE.BROWSER,
      subgroup,
    }));

const SHARED_QUICK_LINK_SUBGROUPS = [
  LINK_GROUP_SUBGROUP.VIGILANT_BROCCOLI,
  LINK_GROUP_SUBGROUP.UI_APPS,
  LINK_GROUP_SUBGROUP.DEV,
  LINK_GROUP_SUBGROUP.LEARN,
];

const SHARED_QUICK_LINKS: QuickLink[] = SHARED_QUICK_LINK_SUBGROUPS.flatMap(
  subgroup =>
    PUBLIC_QUICK_LINKS.filter(
      link => link.subgroup === subgroup && link.type === OPEN_TYPE.BROWSER,
    ).map(link => ({ ...link, target: link.target.trim() })),
);

/** Ordered by subgroup; render with `preserveOrder`. */
export const PASTEBIN_LINKS: QuickLink[] = [
  ...toLinks(PASTEBIN_GROUP_NAME.PERSONAL)([
    PERSONAL_SITE_LINK.INDEX,
    PERSONAL_SITE_LINK.LINKS,
    PERSONAL_SITE_LINK.CALENDAR,
    SOCIAL_LINK.INSTAGRAM_PRETTYDAMNTIRED,
  ]),
  ...toLinks(PASTEBIN_GROUP_NAME.CONTACT)([
    PERSONAL_SITE_LINK.CONTACT,
    EMAIL_LINK,
  ]),
  ...toLinks(PASTEBIN_GROUP_NAME.ADDRESS)([ADDRESS_LINK.ADDRESS]),
  ...toLinks(PASTEBIN_GROUP_NAME.CAREER)([
    PERSONAL_SITE_LINK.RESUME,
    SOCIAL_LINK.LINKEDIN,
  ]),
  ...toLinks(PASTEBIN_GROUP_NAME.SOFTWARE)([
    SOCIAL_LINK.GITHUB,
    PROJECT_LINK.SOFTWARE_PROJECTS,
  ]),
  ...toLinks(PASTEBIN_GROUP_NAME.BUSINESS)([BUSINESS_LINK.SECONDHAND_STORE]),
  ...toLinks(PASTEBIN_GROUP_NAME.COMMUNITY)([
    COMMUNITY_LINK.CLOUD8SKATE,
    SOCIAL_LINK.INSTAGRAM_CLOUD8SKATE,
    SOCIAL_LINK.INSTAGRAM_TORONTOCITYSKATE,
    SOCIAL_LINK.INSTAGRAM_MALMOURBANSKATE,
    SOCIAL_LINK.INSTAGRAM_HUSTLEMALMO,
  ]),
  ...toLinks(PASTEBIN_GROUP_NAME.INTERESTS_AND_HOBBIES)([
    INTEREST_LINK.SPOTIFY,
    INTEREST_LINK.GOODREADS,
    INTEREST_LINK.MYANIMELIST,
    INTEREST_LINK.IMDB,
  ]),
  ...SHARED_QUICK_LINKS,
];
