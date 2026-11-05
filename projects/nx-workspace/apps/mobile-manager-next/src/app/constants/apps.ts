import {
  Activity,
  Mail,
  MapPin,
  Music,
  FileText,
  FolderGit2,
  GitPullRequest,
  GitBranch,
  Play,
  Rocket,
  Workflow,
  type LucideIcon,
} from 'lucide-react';

export type AppEntry = {
  label: string;
  webUrl: string;
  iosUrl?: string;
  androidPackage?: string;
  tileColor: string;
  icon: LucideIcon;
};

const LEISURE_APPS: AppEntry[] = [
  {
    label: 'Spotify',
    webUrl: 'https://open.spotify.com',
    iosUrl: 'spotify:',
    androidPackage: 'com.spotify.music',
    tileColor: 'bg-green-600',
    icon: Music,
  },
  {
    label: 'YouTube',
    webUrl: 'https://www.youtube.com',
    iosUrl: 'youtube://',
    androidPackage: 'com.google.android.youtube',
    tileColor: 'bg-red-600',
    icon: Play,
  },
];

const UTILITY_APPS: AppEntry[] = [
  {
    label: 'Docs',
    webUrl: 'https://docs.harryliu.dev',
    tileColor: 'bg-blue-600',
    icon: FileText,
  },
  {
    label: 'Gmail',
    webUrl: 'https://mail.google.com',
    iosUrl: 'googlegmail://',
    androidPackage: 'com.google.android.gm',
    tileColor: 'bg-rose-500',
    icon: Mail,
  },
  {
    label: 'Google Maps',
    webUrl: 'https://www.google.com/maps',
    iosUrl: 'comgooglemaps://',
    androidPackage: 'com.google.android.apps.maps',
    tileColor: 'bg-blue-600',
    icon: MapPin,
  },
  {
    label: 'Proton Mail',
    webUrl: 'https://mail.proton.me',
    iosUrl: 'protonmail://',
    androidPackage: 'ch.protonmail.android',
    tileColor: 'bg-violet-600',
    icon: Mail,
  },
];

const DEVELOPMENT_APPS: AppEntry[] = [
  {
    label: 'Actions',
    webUrl: 'https://github.com/iamharryliu/vigilant-broccoli/actions',
    tileColor: 'bg-sky-600',
    icon: Workflow,
  },
  {
    label: 'Deployments',
    webUrl: 'https://deployments.harryliu.dev',
    tileColor: 'bg-amber-600',
    icon: Rocket,
  },
  {
    label: 'GitHub',
    webUrl: 'https://github.com',
    iosUrl: 'github://',
    androidPackage: 'com.github.android',
    tileColor: 'bg-gray-900 dark:bg-gray-700',
    icon: GitBranch,
  },
  {
    label: 'Projects',
    webUrl: 'https://projects.harryliu.dev',
    tileColor: 'bg-emerald-600',
    icon: FolderGit2,
  },
  {
    label: 'Pulls',
    webUrl: 'https://github.com/iamharryliu/vigilant-broccoli/pulls',
    tileColor: 'bg-indigo-600',
    icon: GitPullRequest,
  },
  {
    label: 'Status',
    webUrl: 'https://status.harryliu.dev',
    tileColor: 'bg-teal-600',
    icon: Activity,
  },
];

export type AppSection = {
  titleKey: 'APPS.LEISURE' | 'APPS.UTILITY' | 'APPS.DEVELOPMENT';
  apps: AppEntry[];
};

export const APP_SECTIONS: AppSection[] = [
  { titleKey: 'APPS.UTILITY', apps: UTILITY_APPS },
  { titleKey: 'APPS.DEVELOPMENT', apps: DEVELOPMENT_APPS },
  { titleKey: 'APPS.LEISURE', apps: LEISURE_APPS },
];
