import type { PastebinGroup } from '@vigilant-broccoli/common-js';
import {
  BUSINESS_LINK,
  COMMUNITY_LINK,
  EMAIL_LINK,
  INTEREST_LINK,
  PROJECT_LINK,
  SOCIAL_LINK,
} from '@vigilant-broccoli/personal-common-js';

export const PERSONAL_SITE_LINK = {
  INDEX: {
    NAME: 'Index',
    URL: 'https://harryliu.dev/',
  },
  LINKS: {
    NAME: 'Links',
    URL: 'https://harryliu.dev/links',
  },
  CALENDAR: {
    NAME: 'Calendar',
    URL: 'https://harryliu.dev/calendar',
  },
  CONTACT: {
    NAME: 'Contact',
    URL: 'https://harryliu.dev/contact',
  },
  RESUME: {
    NAME: 'Resume',
    URL: 'https://harryliu.dev/resume',
  },
} as const;

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

const toEntry = ({ NAME, URL }: { NAME: string; URL: string }) => ({
  label: NAME,
  value: URL,
});

export const PASTEBIN_GROUPS: PastebinGroup[] = [
  {
    name: PASTEBIN_GROUP_NAME.PERSONAL,
    entries: [
      PERSONAL_SITE_LINK.INDEX,
      PERSONAL_SITE_LINK.LINKS,
      PERSONAL_SITE_LINK.CALENDAR,
      SOCIAL_LINK.INSTAGRAM_PRETTYDAMNTIRED,
    ].map(toEntry),
  },
  {
    name: PASTEBIN_GROUP_NAME.CONTACT,
    entries: [PERSONAL_SITE_LINK.CONTACT, EMAIL_LINK].map(toEntry),
  },
  {
    name: PASTEBIN_GROUP_NAME.ADDRESS,
    entries: [ADDRESS_LINK.ADDRESS].map(toEntry),
  },
  {
    name: PASTEBIN_GROUP_NAME.CAREER,
    entries: [PERSONAL_SITE_LINK.RESUME, SOCIAL_LINK.LINKEDIN].map(toEntry),
  },
  {
    name: PASTEBIN_GROUP_NAME.SOFTWARE,
    entries: [SOCIAL_LINK.GITHUB, PROJECT_LINK.SOFTWARE_PROJECTS].map(toEntry),
  },
  {
    name: PASTEBIN_GROUP_NAME.BUSINESS,
    entries: [BUSINESS_LINK.SECONDHAND_STORE].map(toEntry),
  },
  {
    name: PASTEBIN_GROUP_NAME.COMMUNITY,
    entries: [
      COMMUNITY_LINK.CLOUD8SKATE,
      SOCIAL_LINK.INSTAGRAM_CLOUD8SKATE,
      SOCIAL_LINK.INSTAGRAM_TORONTOCITYSKATE,
      SOCIAL_LINK.INSTAGRAM_MALMOURBANSKATE,
      SOCIAL_LINK.INSTAGRAM_HUSTLEMALMO,
    ].map(toEntry),
  },
  {
    name: PASTEBIN_GROUP_NAME.INTERESTS_AND_HOBBIES,
    entries: [
      INTEREST_LINK.SPOTIFY,
      INTEREST_LINK.GOODREADS,
      INTEREST_LINK.MYANIMELIST,
      INTEREST_LINK.IMDB,
    ].map(toEntry),
  },
];
