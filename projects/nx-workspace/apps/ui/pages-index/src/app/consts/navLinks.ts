import { ComponentType } from 'react';
import { Activity, GitBranch, Globe, Home, Server } from 'lucide-react';
import { DockerIcon, GithubIcon, NpmIcon } from '../components/BrandIcons';
import { DotPaths } from '@vigilant-broccoli/react-lib';
import en from '../i18n/en.json';

type TranslationKey = DotPaths<typeof en>;

export type NavLink = {
  labelKey: TranslationKey;
  href?: string;
  icon?: ComponentType<{ size?: number | string }>;
  children?: NavLink[];
};

export const NAV_LINKS: NavLink[] = [
  { labelKey: 'HOME.TITLE', href: '/', icon: Home },
  { labelKey: 'STATUS_PAGE.TITLE', href: '/status', icon: Activity },
  {
    labelKey: 'OPEN_SOURCE_PAGE.TITLE',
    href: '/open-source',
    icon: GitBranch,
    children: [
      {
        labelKey: 'OPEN_SOURCE_PAGE.GITHUB.TITLE',
        href: '/open-source/github',
        icon: GithubIcon,
      },
      {
        labelKey: 'OPEN_SOURCE_PAGE.DOCKER_HUB.TITLE',
        href: '/open-source/docker',
        icon: DockerIcon,
      },
      {
        labelKey: 'OPEN_SOURCE_PAGE.NPM.TITLE',
        href: '/open-source/npm',
        icon: NpmIcon,
      },
    ],
  },
  {
    labelKey: 'WEB_APPLICATIONS_PAGE.TITLE',
    href: '/web-applications',
    icon: Globe,
  },
  { labelKey: 'API_SERVICES_PAGE.TITLE', href: '/api-services', icon: Server },
];
