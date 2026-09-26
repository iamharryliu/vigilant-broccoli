import type { PastebinGroup } from '@vigilant-broccoli/common-js';
import {
  COMMUNITY_LINK,
  PERSONAL_URL,
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
  RESUME: {
    NAME: 'Resume',
    URL: 'https://harryliu.dev/resume',
  },
} as const;

const OTHER_LINK = {
  ADDRESS: {
    NAME: 'Address',
    URL: 'https://maps.app.goo.gl/E6q6Bnau5dA8AgU4A',
  },
} as const;

const PASTEBIN_GROUP_NAME = {
  SOCIAL: 'Social',
  INSTAGRAM: 'Instagram',
  COMMUNITY: 'Community',
  PERSONAL_SITE: 'harryliu.dev',
  SAVED: 'To Read/Watch/Draw',
  OTHER: 'Other',
} as const;

const toEntry = ({ NAME, URL }: { NAME: string; URL: string }) => ({
  label: NAME,
  value: URL,
});

export const PASTEBIN_GROUPS: PastebinGroup[] = [
  {
    name: PASTEBIN_GROUP_NAME.SOCIAL,
    entries: [
      SOCIAL_LINK.LINKEDIN,
      SOCIAL_LINK.GITHUB,
      PROJECT_LINK.SOFTWARE_PROJECTS,
    ].map(toEntry),
  },
  {
    name: PASTEBIN_GROUP_NAME.INSTAGRAM,
    entries: [
      SOCIAL_LINK.INSTAGRAM_PRETTYDAMNTIRED,
      SOCIAL_LINK.INSTAGRAM_TORONTOCITYSKATE,
      SOCIAL_LINK.INSTAGRAM_HARRYSELLSSHIT,
      SOCIAL_LINK.INSTAGRAM_CLOUD8SKATE,
      SOCIAL_LINK.INSTAGRAM_MALMOURBANSKATE,
      SOCIAL_LINK.INSTAGRAM_HUSTLEMALMO,
    ].map(toEntry),
  },
  {
    name: PASTEBIN_GROUP_NAME.COMMUNITY,
    entries: [COMMUNITY_LINK.CLOUD8SKATE].map(toEntry),
  },
  {
    name: PASTEBIN_GROUP_NAME.PERSONAL_SITE,
    entries: [
      PERSONAL_SITE_LINK.INDEX,
      PERSONAL_SITE_LINK.LINKS,
      PERSONAL_SITE_LINK.CALENDAR,
      PERSONAL_SITE_LINK.RESUME,
    ].map(toEntry),
  },
  {
    name: PASTEBIN_GROUP_NAME.SAVED,
    entries: [
      PERSONAL_URL.TO_READ,
      PERSONAL_URL.TO_WATCH_ANIME,
      PERSONAL_URL.TO_WATCH_MOVIES_SHOWS,
      PERSONAL_URL.TO_DRAW,
      PERSONAL_URL.INSTAGRAM_SAVED,
      PERSONAL_URL.REDDIT_SAVED,
    ].map(toEntry),
  },
  {
    name: PASTEBIN_GROUP_NAME.OTHER,
    entries: [OTHER_LINK.ADDRESS].map(toEntry),
  },
];
