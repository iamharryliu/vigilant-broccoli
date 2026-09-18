'use client';

import { Menu } from 'lucide-react';

type TopbarProps = {
  onMenuClick: () => void;
};

export const Topbar = ({ onMenuClick }: TopbarProps) => {
  return (
    <header
      className="md:hidden fixed top-0 left-0 right-0 z-20 flex h-[var(--topbar-h)] items-center gap-3 border-b border-gray-100 bg-white pl-4 pr-4"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <button
        type="button"
        aria-label="Open menu"
        onClick={onMenuClick}
        className="shrink-0 cursor-pointer rounded-md p-1.5 text-gray-500 hover:bg-gray-50 hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
      >
        <Menu size={20} />
      </button>
      <span className="text-sm font-semibold text-gray-800">VB Manager</span>
    </header>
  );
};
