'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CalendarDays,
  CalendarRange,
  ListChecks,
  ListTodo,
  Mic,
  ScanLine,
  StickyNote,
  LogOut,
} from 'lucide-react';
import { Sidebar, SidebarCTA } from '@vigilant-broccoli/react-lib';
import { signOut } from '../providers/auth-provider';
import { PAGE_TITLE } from '../app.const';

const SIDEBAR_POSITION = 'peer fixed top-0 left-0 bottom-0 z-30';

const FOOTER_ROW =
  'text-sm rounded-md transition-colors flex items-center gap-3 px-2 py-2 m-2 w-[calc(100%-1rem)] text-left text-gray-500 hover:text-black hover:bg-gray-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800';
const FOOTER_LABEL_BASE =
  'whitespace-nowrap overflow-hidden transition-all duration-150';
const FOOTER_LABEL_COLLAPSIBLE =
  'w-0 opacity-0 group-hover/sidebar:w-auto group-hover/sidebar:flex-1 group-hover/sidebar:opacity-100';
const FOOTER_LABEL_VISIBLE = 'flex-1 opacity-100';

const NAV_ITEMS: Omit<SidebarCTA, 'isActive'>[] = [
  { href: '/', label: PAGE_TITLE.HOME, icon: CalendarDays },
  { href: '/tasks', label: PAGE_TITLE.TASKS, icon: ListChecks },
  { href: '/task-list', label: PAGE_TITLE.TASK_LIST, icon: ListTodo },
  { href: '/transcribe', label: PAGE_TITLE.TRANSCRIBE, icon: Mic },
  { href: '/ocr', label: PAGE_TITLE.OCR, icon: ScanLine },
  { href: '/notepad', label: PAGE_TITLE.NOTEPAD, icon: StickyNote },
  {
    href: '/event-calendars',
    label: PAGE_TITLE.EVENT_CALENDARS,
    icon: CalendarRange,
  },
];

type AppSidebarProps = {
  mobileOpen: boolean;
  onMobileClose: () => void;
};

export const AppSidebar = ({ mobileOpen, onMobileClose }: AppSidebarProps) => {
  const pathname = usePathname();

  const items: SidebarCTA[] = NAV_ITEMS.map(item => ({
    ...item,
    isActive: pathname === item.href,
  }));

  return (
    <Sidebar
      items={items}
      LinkComponent={Link}
      className={SIDEBAR_POSITION}
      mobileOpen={mobileOpen}
      onMobileClose={onMobileClose}
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
