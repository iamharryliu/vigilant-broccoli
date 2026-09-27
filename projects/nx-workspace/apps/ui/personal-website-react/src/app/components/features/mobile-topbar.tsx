import { Menu, Moon, Sun } from 'lucide-react';
import { DARK_MODE_LABELS, useTheme } from '../../core/services/theme-context';

const SITE_TITLE = 'harryliu.dev';

const ICON_SIZE = 20;

// z-10 keeps the bar under react-lib's z-20 drawer backdrop. At z-20 it tied
// with the backdrop and, being later in the DOM, stayed undimmed beside the
// dimmed page whenever the drawer was open.
const TOPBAR =
  'lg:hidden fixed top-0 left-0 right-0 z-10 flex h-[var(--topbar-h)] items-center gap-3 border-b border-gray-100 bg-white pl-4 pr-4 dark:border-gray-800 dark:bg-zinc-900';

const ICON_BUTTON =
  'shrink-0 cursor-pointer rounded-md p-1.5 text-gray-500 hover:bg-gray-50 hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white';

type Props = {
  onMenuClick: () => void;
};

export function MobileTopbar({ onMenuClick }: Props) {
  const { isDark, toggleDarkMode } = useTheme();

  return (
    <header className={TOPBAR}>
      <button
        type="button"
        aria-label="Open menu"
        onClick={onMenuClick}
        className={ICON_BUTTON}
      >
        <Menu size={ICON_SIZE} />
      </button>
      <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
        {SITE_TITLE}
      </span>
      <button
        type="button"
        aria-label={isDark ? DARK_MODE_LABELS.toLight : DARK_MODE_LABELS.toDark}
        onClick={toggleDarkMode}
        className={`ml-auto ${ICON_BUTTON}`}
      >
        {isDark ? <Sun size={ICON_SIZE} /> : <Moon size={ICON_SIZE} />}
      </button>
    </header>
  );
}
