'use client';

import { Sidebar, SidebarCTA, useTheme } from '@vigilant-broccoli/react-lib';
import { signIn, signOut, useSession } from 'next-auth/react';
import {
  MessageCircle,
  Mail,
  Search,
  Moon,
  Sun,
  Calendar,
  StickyNote,
  Timer,
  LogOut,
  LogIn,
  Bell,
} from 'lucide-react';
import { NotificationRecord } from '../hooks/useNotificationHistory';
import { NotificationsDialog } from './notifications-dialog.component';

const LIGHT = 'light';
const DARK_MODE_LABEL = 'Dark mode';
const LIGHT_MODE_LABEL = 'Light mode';
const THEME_SHORTCUT = ' (D)';
const UNREAD_MAX = 9;
const UNREAD_MAX_LABEL = '9+';

const BellIconWithBadge = ({ unreadCount }: { unreadCount: number }) => (
  <span className="relative inline-flex">
    <Bell size={18} />
    {unreadCount > 0 && (
      <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center px-[3px] leading-none">
        {unreadCount > UNREAD_MAX ? UNREAD_MAX_LABEL : unreadCount}
      </span>
    )}
  </span>
);

type Props = {
  setChatbotDialogOpen: (open: boolean) => void;
  setEmailDialogOpen: (open: boolean) => void;
  setCalendarDialogOpen: (open: boolean) => void;
  setNotepadDialogOpen: (open: boolean) => void;
  setPomodoroDialogOpen: (open: boolean) => void;
  setSearchDialogOpen: (open: boolean) => void;
  notificationsOpen: boolean;
  setNotificationsOpen: (open: boolean) => void;
  unreadCount: number;
  notifications: NotificationRecord[];
  onClearNotifications: () => void;
};

export const RightSidebar = ({
  setChatbotDialogOpen,
  setEmailDialogOpen,
  setCalendarDialogOpen,
  setNotepadDialogOpen,
  setPomodoroDialogOpen,
  setSearchDialogOpen,
  notificationsOpen,
  setNotificationsOpen,
  unreadCount,
  notifications,
  onClearNotifications,
}: Props) => {
  const { appearance, toggleTheme } = useTheme();
  const { data: session } = useSession();
  const isLight = appearance === LIGHT;
  const themeLabel = isLight ? DARK_MODE_LABEL : LIGHT_MODE_LABEL;
  const BellIcon = () => <BellIconWithBadge unreadCount={unreadCount} />;

  const items: SidebarCTA[] = [
    {
      label: 'Notifications',
      icon: BellIcon,
      title: 'Notifications',
      onClick: () => setNotificationsOpen(!notificationsOpen),
      isActive: notificationsOpen,
    },
    {
      label: 'Jarvis',
      icon: MessageCircle,
      title: 'Jarvis (C)',
      onClick: () => setChatbotDialogOpen(true),
    },
    {
      label: 'Email',
      icon: Mail,
      title: 'Email (M)',
      onClick: () => setEmailDialogOpen(true),
    },
    {
      label: 'Calendar',
      icon: Calendar,
      title: 'Calendar (Shift+C)',
      onClick: () => setCalendarDialogOpen(true),
    },
    {
      label: 'Notepad',
      icon: StickyNote,
      title: 'Notepad (N)',
      onClick: () => setNotepadDialogOpen(true),
    },
    {
      label: 'Pomodoro',
      icon: Timer,
      title: 'Pomodoro (Shift+P)',
      onClick: () => setPomodoroDialogOpen(true),
    },
    {
      label: 'Search',
      icon: Search,
      title: 'Search (/)',
      onClick: () => setSearchDialogOpen(true),
    },
    {
      label: themeLabel,
      icon: isLight ? Moon : Sun,
      title: themeLabel + THEME_SHORTCUT,
      onClick: toggleTheme,
    },
    ...(session
      ? [
          {
            label: 'Sign Out',
            icon: LogOut,
            title: 'Sign Out',
            onClick: () => signOut(),
          },
        ]
      : [
          {
            label: 'Sign In',
            icon: LogIn,
            title: 'Sign In',
            onClick: () => signIn('google'),
          },
        ]),
  ];

  return (
    <div className="flex h-full">
      {notificationsOpen && (
        <div className="w-72 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex flex-col overflow-hidden">
          <NotificationsDialog
            notifications={notifications}
            onClear={onClearNotifications}
          />
        </div>
      )}
      <Sidebar items={items} side="right" align="space-evenly" />
    </div>
  );
};
