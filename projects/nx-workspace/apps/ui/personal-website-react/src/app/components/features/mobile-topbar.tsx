import { Menu } from 'lucide-react';

const SITE_TITLE = 'design by harry';

type Props = {
  onMenuClick: () => void;
};

export function MobileTopbar({ onMenuClick }: Props) {
  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-20 flex h-[var(--topbar-h)] items-center gap-3 border-b border-gray-100 bg-white pl-4 pr-4 dark:border-gray-800 dark:bg-zinc-900">
      <button
        type="button"
        aria-label="Open menu"
        onClick={onMenuClick}
        className="shrink-0 cursor-pointer rounded-md p-1.5 text-gray-500 hover:bg-gray-50 hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
      >
        <Menu size={20} />
      </button>
      <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
        {SITE_TITLE}
      </span>
    </header>
  );
}
