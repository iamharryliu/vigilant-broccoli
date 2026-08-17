'use client';

import { notFound } from 'next/navigation';
import { useState } from 'react';
import { Menu } from 'lucide-react';
import { IS_DEV } from '../../app.consts';
import Sidebar from '../../components/Sidebar';

const OPEN_MENU_LABEL = 'Open menu';
const TOPBAR_CLASS =
  'md:hidden fixed top-0 left-0 right-0 z-10 flex h-12 items-center gap-3 border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-950';
const MENU_BUTTON_CLASS =
  'cursor-pointer rounded-md p-1 text-gray-500 hover:bg-gray-50 hover:text-black dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white';

// Renders hearth's real Sidebar + NAV_LINKS outside AppLayout's auth gate so
// Playwright can exercise the actual icon-bearing nav config (Home >
// Whiteboard/Calendar) without a live Supabase session. Dev-only: 404s in
// production. See libs/@vigilant-broccoli/react-lib/docs/features/sidebar.md.
export default function SidebarSandboxPage() {
  if (!IS_DEV) notFound();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen">
      <header className={TOPBAR_CLASS}>
        <button
          type="button"
          aria-label={OPEN_MENU_LABEL}
          onClick={() => setSidebarOpen(open => !open)}
          className={MENU_BUTTON_CLASS}
        >
          <Menu size={20} />
        </button>
      </header>
      <Sidebar
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />
    </div>
  );
}
