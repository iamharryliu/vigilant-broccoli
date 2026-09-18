import type { PastebinGroup } from '@vigilant-broccoli/common-js';

export const SOCIAL_LINK = {
  LINKEDIN: {
    NAME: 'LinkedIn',
    URL: 'https://www.linkedin.com/in/iamharryliu/',
  },
  GITHUB: {
    NAME: 'GitHub',
    URL: 'https://github.com/iamharryliu',
  },
  INSTAGRAM_PRETTYDAMNTIRED: {
    NAME: 'Instagram - prettydamntired',
    URL: 'https://www.instagram.com/prettydamntired/',
  },
  INSTAGRAM_TORONTOCITYSKATE: {
    NAME: 'Instagram - torontocityskate',
    URL: 'https://www.instagram.com/torontocityskate/',
  },
  INSTAGRAM_HARRYSELLSSHIT: {
    NAME: 'Instagram - harrysellsshit',
    URL: 'https://www.instagram.com/harrysellsshit/',
  },
  INSTAGRAM_CLOUD8SKATE: {
    NAME: 'Instagram - cloud8skate',
    URL: 'https://www.instagram.com/cloud8skate/',
  },
} as const;

export const PERSONAL_SITE_LINK = {
  INDEX: {
    NAME: 'Index',
    URL: 'https://harryliu.dev/',
  },
  LINKS: {
    NAME: 'Links',
    URL: 'https://harryliu.dev/links',
  },
  PROJECTS: {
    NAME: 'Projects',
    URL: 'https://harryliu.dev/projects',
  },
  RESUME: {
    NAME: 'Resume',
    URL: 'https://harryliu.dev/resume',
  },
} as const;

const PASTEBIN_GROUP_NAME = {
  SOCIAL: 'Social',
  INSTAGRAM: 'Instagram',
  PERSONAL_SITE: 'harryliu.dev',
} as const;

const toEntry = ({ NAME, URL }: { NAME: string; URL: string }) => ({
  label: NAME,
  value: URL,
});

export const PASTEBIN_GROUPS: PastebinGroup[] = [
  {
    name: PASTEBIN_GROUP_NAME.SOCIAL,
    entries: [SOCIAL_LINK.LINKEDIN, SOCIAL_LINK.GITHUB].map(toEntry),
  },
  {
    name: PASTEBIN_GROUP_NAME.INSTAGRAM,
    entries: [
      SOCIAL_LINK.INSTAGRAM_PRETTYDAMNTIRED,
      SOCIAL_LINK.INSTAGRAM_TORONTOCITYSKATE,
      SOCIAL_LINK.INSTAGRAM_HARRYSELLSSHIT,
      SOCIAL_LINK.INSTAGRAM_CLOUD8SKATE,
    ].map(toEntry),
  },
  {
    name: PASTEBIN_GROUP_NAME.PERSONAL_SITE,
    entries: [
      PERSONAL_SITE_LINK.INDEX,
      PERSONAL_SITE_LINK.LINKS,
      PERSONAL_SITE_LINK.PROJECTS,
      PERSONAL_SITE_LINK.RESUME,
    ].map(toEntry),
  },
];
