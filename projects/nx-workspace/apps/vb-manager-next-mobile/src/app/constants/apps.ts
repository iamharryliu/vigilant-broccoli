import { Mail, FileText, Play, type LucideIcon } from 'lucide-react';

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
    label: 'Docs',
    webUrl: 'https://docs.harryliu.dev',
    tileColor: 'bg-blue-600',
    icon: FileText,
  },
];
