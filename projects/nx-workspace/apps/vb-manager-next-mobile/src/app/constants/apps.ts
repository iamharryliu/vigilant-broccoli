import {
  Mail,
  FileText,
  FolderGit2,
  GitBranch,
  Play,
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

export const APPS: AppEntry[] = [
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
  {
    label: 'GitHub',
    webUrl: 'https://github.com',
    iosUrl: 'github://',
    androidPackage: 'com.github.android',
    tileColor: 'bg-gray-900 dark:bg-gray-700',
    icon: GitBranch,
  },
  {
    label: 'Docs',
    webUrl: 'https://docs.harryliu.dev',
    tileColor: 'bg-blue-600',
    icon: FileText,
  },
  {
    label: 'Projects',
    webUrl: 'https://projects.harryliu.dev',
    tileColor: 'bg-emerald-600',
    icon: FolderGit2,
  },
];
