'use client';

import { Sidebar, SidebarCTA } from '@vigilant-broccoli/react-lib';
import { signInWithGoogle, signOut, useAuth } from '../../../libs/auth';
import { usePathname, useRouter } from 'next/navigation';
import {
  MessageCircle,
  Mail,
  Search,
  Calendar,
  Timer,
  LogOut,
  LogIn,
  Bell,
  Settings,
  House,
  SquareKanban,
  LayoutDashboard,
  ClipboardList,
  MessageSquare,
  CalendarDays,
  Languages,
  FlaskConical,
  Briefcase,
} from 'lucide-react';
import { NotificationRecord } from '../hooks/useNotificationHistory';
import { NotificationsDialog } from './notifications-dialog.component';
import { SIDEBAR_ROUTE } from '../app.const';

const SETTINGS_PATH = '/settings';

const SIDEBAR_ROUTE_ITEMS = [
  { route: SIDEBAR_ROUTE.INDEX, icon: House },
  { route: SIDEBAR_ROUTE.KANBAN, icon: SquareKanban },
  { route: SIDEBAR_ROUTE.DEV_DASHBOARD, icon: LayoutDashboard },
  { route: SIDEBAR_ROUTE.PASTEBIN, icon: ClipboardList },
  { route: SIDEBAR_ROUTE.CHATBOT, icon: MessageSquare },
  { route: SIDEBAR_ROUTE.EVENT_CALENDARS, icon: CalendarDays },
  { route: SIDEBAR_ROUTE.LANGUAGE_LEARNING, icon: Languages },
  { route: SIDEBAR_ROUTE.FEATURE_SANDBOX, icon: FlaskConical },
  { route: SIDEBAR_ROUTE.CAREER, icon: Briefcase },
];

const UNREAD_MAX = 9;
const UNREAD_MAX_LABEL = '9+';

const PANEL_BASE_CLASSES =
  'border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex flex-col overflow-hidden transition-[width,opacity] duration-300 ease-in-out motion-reduce:transition-none';
const PANEL_OPEN_CLASSES = 'w-72 opacity-100';
const PANEL_CLOSED_CLASSES = 'w-0 opacity-0 border-l-0';
const PANEL_CONTENT_BASE_CLASSES =
  'w-72 h-full shrink-0 transition-transform duration-300 ease-in-out motion-reduce:transition-none';
const PANEL_CONTENT_OPEN_CLASSES = 'translate-x-0';
const PANEL_CONTENT_CLOSED_CLASSES = 'translate-x-full';

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
  setPomodoroDialogOpen,
  setSearchDialogOpen,
  notificationsOpen,
  setNotificationsOpen,
  unreadCount,
  notifications,
  onClearNotifications,
}: Props) => {
  const session = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const BellIcon = () => <BellIconWithBadge unreadCount={unreadCount} />;

  const items: SidebarCTA[] = [
    {
      label: 'Notifications',
      icon: BellIcon,
      title: 'Notifications',
      onClick: () => setNotificationsOpen(!notificationsOpen),
      isActive: notificationsOpen,
    },
    ...SIDEBAR_ROUTE_ITEMS.map(({ route, icon }) => ({
      label: route.title,
      icon,
      title: route.title,
      onClick: () => router.push(route.path),
      isActive: pathname === route.path,
    })),
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
      label: 'Settings',
      icon: Settings,
      title: 'Settings',
      onClick: () => router.push(SETTINGS_PATH),
      isActive: pathname === SETTINGS_PATH,
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
            onClick: () => signInWithGoogle(),
          },
        ]),
  ];

  return (
    <div className="flex h-full">
      <div
        className={`${PANEL_BASE_CLASSES} ${notificationsOpen ? PANEL_OPEN_CLASSES : PANEL_CLOSED_CLASSES}`}
        aria-hidden={!notificationsOpen}
        inert={!notificationsOpen}
      >
        <div
          className={`${PANEL_CONTENT_BASE_CLASSES} ${notificationsOpen ? PANEL_CONTENT_OPEN_CLASSES : PANEL_CONTENT_CLOSED_CLASSES}`}
        >
          <NotificationsDialog
            notifications={notifications}
            onClear={onClearNotifications}
          />
        </div>
      </div>
      <Sidebar items={items} side="right" align="space-evenly" />
    </div>
  );
};
