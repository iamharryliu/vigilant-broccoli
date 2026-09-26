import type { PastebinGroup } from '@vigilant-broccoli/common-js';
import {
  COMMUNITY_LINK,
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

const ADDRESS_LINK = {
  ADDRESS: {
    NAME: 'Address',
    URL: 'https://maps.app.goo.gl/E6q6Bnau5dA8AgU4A',
  },
} as const;

const PASTEBIN_GROUP_NAME = {
  PERSONAL: 'Personal',
  COMMUNITY: 'Community',
  CAREER: 'Career',
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
      ADDRESS_LINK.ADDRESS,
    ].map(toEntry),
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
    name: PASTEBIN_GROUP_NAME.CAREER,
    entries: [
      SOCIAL_LINK.LINKEDIN,
      SOCIAL_LINK.GITHUB,
      PROJECT_LINK.SOFTWARE_PROJECTS,
      PERSONAL_SITE_LINK.RESUME,
    ].map(toEntry),
  },
  {
    name: PASTEBIN_GROUP_NAME.INTERESTS_AND_HOBBIES,
    entries: [SOCIAL_LINK.INSTAGRAM_HARRYSELLSSHIT].map(toEntry),
  },
];
