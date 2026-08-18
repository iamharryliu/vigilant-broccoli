'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Calendar,
  CalendarRange,
  ListChecks,
  ListTodo,
  Mic,
  ScanLine,
  NotebookPen,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { Sidebar, SidebarCTA } from '@vigilant-broccoli/react-lib';
import { signOut } from '../providers/auth-provider';

const SIDEBAR_POSITION = 'peer fixed top-0 left-0 bottom-0 z-30';

const FOOTER_ROW =
  'text-sm rounded-md transition-colors flex items-center gap-3 px-2 py-2 m-2 w-[calc(100%-1rem)] text-left text-gray-500 hover:text-black hover:bg-gray-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800';
const FOOTER_LABEL_BASE =
  'whitespace-nowrap overflow-hidden transition-all duration-150';
const FOOTER_LABEL_COLLAPSIBLE =
  'w-0 opacity-0 group-hover/sidebar:w-auto group-hover/sidebar:flex-1 group-hover/sidebar:opacity-100';
const FOOTER_LABEL_VISIBLE = 'flex-1 opacity-100';

const AI_TOOLS_ID = 'ai-tools';

const NAV_ITEMS: Omit<SidebarCTA, 'isActive'>[] = [
  {
    id: AI_TOOLS_ID,
    label: 'AI Tools',
    icon: Sparkles,
    children: [
      { href: '/', label: 'Create Calendar', icon: Calendar },
      { href: '/tasks', label: 'Create Tasks', icon: ListChecks },
    ],
  },
  { href: '/task-list', label: 'My Tasks', icon: ListTodo },
  { href: '/transcribe', label: 'Transcribe', icon: Mic },
  { href: '/ocr', label: 'Scan', icon: ScanLine },
  { href: '/notepad', label: 'Notepad', icon: NotebookPen },
  { href: '/event-calendars', label: 'Event Calendars', icon: CalendarRange },
];

const withActiveState = (
  item: Omit<SidebarCTA, 'isActive'>,
  pathname: string,
): SidebarCTA => ({
  ...item,
  isActive: pathname === item.href,
  children: item.children?.map(child => withActiveState(child, pathname)),
});

const isGroupActive = (
  item: Omit<SidebarCTA, 'isActive'>,
  pathname: string,
): boolean =>
  item.href === pathname ||
  (item.children?.some(child => isGroupActive(child, pathname)) ?? false);

type AppSidebarProps = {
  mobileOpen: boolean;
  onMobileClose: () => void;
};

export const AppSidebar = ({ mobileOpen, onMobileClose }: AppSidebarProps) => {
  const pathname = usePathname();

  const items: SidebarCTA[] = NAV_ITEMS.map(item =>
    withActiveState(item, pathname),
  );
  const aiTools = NAV_ITEMS.find(item => item.id === AI_TOOLS_ID);
  const defaultOpenId =
    aiTools && isGroupActive(aiTools, pathname) ? AI_TOOLS_ID : null;

  return (
    <Sidebar
      items={items}
      LinkComponent={Link}
      className={SIDEBAR_POSITION}
      mobileOpen={mobileOpen}
      onMobileClose={onMobileClose}
      defaultOpenId={defaultOpenId}
      footer={
        <button type="button" onClick={() => signOut()} className={FOOTER_ROW}>
          <span className="shrink-0">
            <LogOut size={18} />
          </span>
          <span
            className={`${FOOTER_LABEL_BASE} ${mobileOpen ? FOOTER_LABEL_VISIBLE : FOOTER_LABEL_COLLAPSIBLE}`}
          >
            Sign out
          </span>
        </button>
      }
    />
  );
};
