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

const PERSONAL_APPS: AppEntry[] = [
  {
    label: 'Google Maps',
    webUrl: 'https://www.google.com/maps',
    iosUrl: 'comgooglemaps://',
    androidPackage: 'com.google.android.apps.maps',
    tileColor: 'bg-blue-600',
    icon: MapPin,
  },
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
  {
    label: 'Gmail',
    webUrl: 'https://mail.google.com',
    iosUrl: 'googlegmail://',
    androidPackage: 'com.google.android.gm',
    tileColor: 'bg-rose-500',
    icon: Mail,
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
    label: 'GitHub',
    webUrl: 'https://github.com',
    iosUrl: 'github://',
    androidPackage: 'com.github.android',
    tileColor: 'bg-gray-900 dark:bg-gray-700',
    icon: GitBranch,
  },
  {
    label: 'Pulls',
    webUrl: 'https://github.com/iamharryliu/vigilant-broccoli/pulls',
    tileColor: 'bg-indigo-600',
    icon: GitPullRequest,
  },
  {
    label: 'Actions',
    webUrl: 'https://github.com/iamharryliu/vigilant-broccoli/actions',
    tileColor: 'bg-sky-600',
    icon: Workflow,
  },
  {
    label: 'Docs',
    webUrl: 'https://docs.harryliu.dev',
    tileColor: 'bg-blue-600',
    icon: FileText,
  },
  {
    label: 'Status',
    webUrl: 'https://status.harryliu.dev',
    tileColor: 'bg-teal-600',
    icon: Activity,
  },
  {
    label: 'Projects',
    webUrl: 'https://projects.harryliu.dev',
    tileColor: 'bg-emerald-600',
    icon: FolderGit2,
  },
  {
    label: 'Deployments',
    webUrl: 'https://deployments.harryliu.dev',
    tileColor: 'bg-amber-600',
    icon: Rocket,
  },
];

export type AppSection = {
  title?: string;
  apps: AppEntry[];
};

export const APP_SECTIONS: AppSection[] = [
  { apps: PERSONAL_APPS },
  { title: 'Development', apps: DEVELOPMENT_APPS },
];
