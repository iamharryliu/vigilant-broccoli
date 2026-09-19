import { ReactNode, useEffect, useMemo, useState } from 'react';
import { Theme } from '@radix-ui/themes';
import {
  Blocks,
  Eye,
  Menu,
  Moon,
  Settings as SettingsIcon,
  Sun,
  Wrench,
} from 'lucide-react';
import {
  Sidebar,
  SidebarCTA,
  Switch,
  Heading,
  Text,
} from '@vigilant-broccoli/react-lib';
import {
  AlarmUtilityContent,
  CalculatorUtilityContent,
  CookingConversionsUtilityContent,
  CurrencyConverterUtilityContent,
  StopwatchUtilityContent,
  TimerUtilityContent,
} from '@vigilant-broccoli/react-utility';
import { AvatarDemo } from './demos/AvatarDemo';
import { UserAvatarDemo } from './demos/UserAvatarDemo';
import { ButtonDemo } from './demos/ButtonDemo';
import { CollapsibleListItemDemo } from './demos/CollapsibleListItemDemo';
import { CRUDListNoImagesDemo } from './demos/CRUDListNoImagesDemo';
import { DashboardInfoCardDemo } from './demos/DashboardInfoCardDemo';
import { CRUDListWithImagesDemo } from './demos/CRUDListWithImagesDemo';
import { DocsExplorerDemo } from './demos/DocsExplorerDemo';
import { SelectDemo } from './demos/SelectDemo';
import { ErrorDemo } from './demos/ErrorDemo';
import { GithubActionsBadgesDemo } from './demos/GithubActionsBadgesDemo';
import { StatusCardListDemo } from './demos/StatusCardListDemo';
import { TabsDemo } from './demos/TabsDemo';
import { TooltipDemo } from './demos/TooltipDemo';
import { SwitchDemo } from './demos/SwitchDemo';
import { ToasterDemo } from './demos/ToasterDemo';
import { UserLeaderboardDemo } from './demos/UserLeaderboardDemo';
import { GroupLeaderboardDemo } from './demos/GroupLeaderboardDemo';
import { EmptyLeaderboardDemo } from './demos/EmptyLeaderboardDemo';
import { NotepadDemo } from './demos/NotepadDemo';
import { QuickLinksDemo } from './demos/QuickLinksDemo';
import { ScrollTimelineDemo } from './demos/ScrollTimelineDemo';
import { TasksDemo } from './demos/TasksDemo';

const CRUD_STORAGE_KEYS = {
  IS_CARDS: 'component-sandbox-crud-is-cards',
  SHOW_ELLIPSIS: 'component-sandbox-crud-show-ellipsis',
  FULL_WIDTH_IMAGE: 'component-sandbox-crud-full-width-image',
};

const CRUD_SWITCH_LABEL = {
  CARDS: 'Cards',
  ELLIPSIS: 'Ellipsis',
  FULL_WIDTH_IMAGE: 'Full-width image',
} as const;

const SELECTED_ID_STORAGE_KEY = 'component-sandbox-selected-id';
const ICON_MODE_STORAGE_KEY = 'component-sandbox-icon-mode';

const SETTINGS_LABEL = {
  GROUP: 'Settings',
  DARK_MODE_ON: 'Light Mode',
  DARK_MODE_OFF: 'Dark Mode',
  ICON_MODE_ON: 'Icons: On',
  ICON_MODE_OFF: 'Icons: Off',
} as const;

const CATEGORY = {
  COMPONENTS: 'Components',
  UTILITIES: 'Utilities',
} as const;
type Category = (typeof CATEGORY)[keyof typeof CATEGORY];
const CATEGORY_ICON = {
  [CATEGORY.COMPONENTS]: Blocks,
  [CATEGORY.UTILITIES]: Wrench,
} as const;

interface SandboxEntry {
  id: string;
  label: string;
  description: string;
  category: Category;
  content: ReactNode;
}

const CRUDListSection = () => {
  const [isCards, setIsCards] = useState(false);
  const [showEllipsis, setShowEllipsis] = useState(true);
  const [fullWidthImage, setFullWidthImage] = useState(false);

  useEffect(() => {
    setIsCards(localStorage.getItem(CRUD_STORAGE_KEYS.IS_CARDS) === 'true');
    setShowEllipsis(
      localStorage.getItem(CRUD_STORAGE_KEYS.SHOW_ELLIPSIS) !== 'false',
    );
    setFullWidthImage(
      localStorage.getItem(CRUD_STORAGE_KEYS.FULL_WIDTH_IMAGE) === 'true',
    );
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <Switch
            checked={isCards}
            onCheckedChange={v => {
              setIsCards(v);
              localStorage.setItem(CRUD_STORAGE_KEYS.IS_CARDS, String(v));
            }}
          />
          {CRUD_SWITCH_LABEL.CARDS}
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <Switch
            checked={showEllipsis}
            onCheckedChange={v => {
              setShowEllipsis(v);
              localStorage.setItem(CRUD_STORAGE_KEYS.SHOW_ELLIPSIS, String(v));
            }}
          />
          {CRUD_SWITCH_LABEL.ELLIPSIS}
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <Switch
            checked={fullWidthImage}
            onCheckedChange={v => {
              setFullWidthImage(v);
              localStorage.setItem(
                CRUD_STORAGE_KEYS.FULL_WIDTH_IMAGE,
                String(v),
              );
            }}
          />
          {CRUD_SWITCH_LABEL.FULL_WIDTH_IMAGE}
        </label>
      </div>
      <CRUDListNoImagesDemo isCards={isCards} showEllipsis={showEllipsis} />
      <CRUDListWithImagesDemo
        isCards={isCards}
        showEllipsis={showEllipsis}
        fullWidthImage={fullWidthImage}
      />
    </div>
  );
};

const COMPONENT_ENTRIES: SandboxEntry[] = [
  {
    id: 'avatar',
    label: 'Avatar',
    description:
      'Avatar sizes, image and initial fallbacks, generated boring-avatar variants and the editable overlay.',
    category: CATEGORY.COMPONENTS,
    content: <AvatarDemo />,
  },
  {
    id: 'buttons',
    label: 'Buttons',
    description:
      'The full button set - variants, icon buttons, copy and close buttons, provider sign-in buttons and button lists.',
    category: CATEGORY.COMPONENTS,
    content: <ButtonDemo />,
  },
  {
    id: 'collapsible-list-item',
    label: 'Collapsible List Item',
    description:
      'Accordion and collapsible list rows, with plain text and rich content inside.',
    category: CATEGORY.COMPONENTS,
    content: <CollapsibleListItemDemo />,
  },
  {
    id: 'crud-list',
    label: 'CRUD List Management',
    description:
      'List and card layouts for create/read/update/delete management, with optional images, ellipsis menus and full-width thumbnails.',
    category: CATEGORY.COMPONENTS,
    content: <CRUDListSection />,
  },
  {
    id: 'empty-leaderboard',
    label: 'Empty Leaderboard',
    description:
      'The leaderboard in its loading and empty states, before any rows hydrate.',
    category: CATEGORY.COMPONENTS,
    content: <EmptyLeaderboardDemo />,
  },
  {
    id: 'error',
    label: 'Error Handling',
    description:
      'Error surfaces - inline callouts, a transient alert and a blocking dialog.',
    category: CATEGORY.COMPONENTS,
    content: <ErrorDemo />,
  },
  {
    id: 'github-actions-badges',
    label: 'GitHub Actions Badges',
    description:
      'Workflow status badges for a repo, plain and wrapped in a card container.',
    category: CATEGORY.COMPONENTS,
    content: <GithubActionsBadgesDemo />,
  },
  {
    id: 'group-leaderboard',
    label: 'Group Leaderboard',
    description:
      'Team leaderboard with period switching, sortable metrics and polled refreshes against mock data.',
    category: CATEGORY.COMPONENTS,
    content: <GroupLeaderboardDemo />,
  },
  {
    id: 'scroll-timeline',
    label: 'Scroll Timeline',
    description:
      'A running balance timeline, scroll-linked to a series of dated entries.',
    category: CATEGORY.COMPONENTS,
    content: <ScrollTimelineDemo />,
  },
  {
    id: 'select',
    label: 'Select',
    description:
      'Select bound to string, number and object options, each with its own selected-value rendering.',
    category: CATEGORY.COMPONENTS,
    content: <SelectDemo />,
  },
  {
    id: 'status-card-list',
    label: 'Status Card List',
    description:
      'Status rows with badges, monospace detail text and per-row actions, flat or grouped.',
    category: CATEGORY.COMPONENTS,
    content: <StatusCardListDemo />,
  },
  {
    id: 'switch',
    label: 'Switch',
    description:
      'Switch in its default, checked, disabled and controlled forms.',
    category: CATEGORY.COMPONENTS,
    content: <SwitchDemo />,
  },
  {
    id: 'tabs',
    label: 'Tabs',
    description:
      'Tabs with panel content, driven by the react-lib shim over the underlying primitive.',
    category: CATEGORY.COMPONENTS,
    content: <TabsDemo />,
  },
  {
    id: 'toaster',
    label: 'Toaster',
    description:
      'Toast notifications - info, success, warning, error and promise-driven toasts.',
    category: CATEGORY.COMPONENTS,
    content: <ToasterDemo />,
  },
  {
    id: 'tooltip',
    label: 'Tooltip',
    description:
      'Tooltips on each side of a trigger, with the provider wiring they need.',
    category: CATEGORY.COMPONENTS,
    content: <TooltipDemo />,
  },
  {
    id: 'user-avatar',
    label: 'User Avatar',
    description:
      'The user avatar with upload handling, generated variants and the states around a pending image.',
    category: CATEGORY.COMPONENTS,
    content: <UserAvatarDemo />,
  },
  {
    id: 'user-leaderboard',
    label: 'User Leaderboard',
    description:
      'User leaderboard with sortable metrics, column toggles, paging and live rank changes.',
    category: CATEGORY.COMPONENTS,
    content: <UserLeaderboardDemo />,
  },
];

const UTILITY_ENTRIES: SandboxEntry[] = [
  {
    id: 'alarm',
    label: 'Alarm',
    description:
      'Set alarms that persist locally and fire with an audible alert.',
    category: CATEGORY.UTILITIES,
    content: <AlarmUtilityContent />,
  },
  {
    id: 'calculator',
    label: 'Calculator',
    description: 'Basic arithmetic calculator with a keyboard-driven keypad.',
    category: CATEGORY.UTILITIES,
    content: <CalculatorUtilityContent />,
  },
  {
    id: 'cooking-conversions',
    label: 'Cooking Conversions',
    description:
      'Convert between cooking volumes, weights and temperatures, both directions.',
    category: CATEGORY.UTILITIES,
    content: <CookingConversionsUtilityContent />,
  },
  {
    id: 'currency-converter',
    label: 'Currency Converter',
    description:
      'Convert between currencies against live rates, with a locally stored conversion history.',
    category: CATEGORY.UTILITIES,
    content: <CurrencyConverterUtilityContent />,
  },
  {
    id: 'dashboard-info-card',
    label: 'Dashboard Info Card',
    description:
      'Clock, weather, the next sunrise/sunset and the current moon phase. Sun times and moon phase are computed locally from the location, so only the weather tile needs data.',
    category: CATEGORY.UTILITIES,
    content: <DashboardInfoCardDemo />,
  },
  {
    id: 'docs-explorer',
    label: 'Docs Explorer',
    description:
      'The docs explorer is the file-tree + search shell behind docs.harryliu.dev. It is not mounted here - it needs a notes tree to browse - so this page links to the live site and shows what it looks like there.',
    category: CATEGORY.UTILITIES,
    content: <DocsExplorerDemo />,
  },
  {
    id: 'notepad',
    label: 'Notepad',
    description:
      'A synced text editor with syntax highlighting, standing in for the notepad surface.',
    category: CATEGORY.UTILITIES,
    content: <NotepadDemo />,
  },
  {
    id: 'quick-links',
    label: 'Quick Links',
    description:
      'Fuzzy-searchable link launcher, as a command dialog and as an inline panel.',
    category: CATEGORY.UTILITIES,
    content: <QuickLinksDemo />,
  },
  {
    id: 'stopwatch',
    label: 'Stopwatch',
    description: 'Stopwatch with lap splits.',
    category: CATEGORY.UTILITIES,
    content: <StopwatchUtilityContent />,
  },
  {
    id: 'tasks',
    label: 'Tasks',
    description:
      'Runs the shared tasks component against an in-memory tasks API with simulated latency. Voice input calls the mocked transcription and parse endpoints.',
    category: CATEGORY.UTILITIES,
    content: <TasksDemo />,
  },
  {
    id: 'timer',
    label: 'Timer',
    description: 'Countdown timer with presets and an audible finish.',
    category: CATEGORY.UTILITIES,
    content: <TimerUtilityContent />,
  },
];

const ALL_ENTRIES: SandboxEntry[] = [...COMPONENT_ENTRIES, ...UTILITY_ENTRIES];

const ENTRY_STAGE_CLASS = 'flex flex-col gap-3 mt-2';

const SIDEBAR_POSITION_CLASS = 'fixed top-0 left-0 bottom-0 z-30 peer';
const CONTENT_WRAPPER_BASE_CLASS =
  'h-full overflow-y-auto pt-12 md:pt-0 pl-0 transition-[padding] duration-200';
// In icon mode the sidebar itself collapses to an icon rail and only
// expands to full width on hover (see canCollapse in Sidebar.tsx) - the
// content needs the matching peer-hover pair to shift with it instead of
// staying padded for the expanded width. Icon-less mode has no rail to
// collapse to (the sidebar is always full width), so the content stays
// statically padded to match.
const CONTENT_WRAPPER_COLLAPSIBLE_CLASS = 'md:pl-14 md:peer-hover:pl-48';
const CONTENT_WRAPPER_FIXED_CLASS = 'md:pl-48';
const TOPBAR_CLASS =
  'md:hidden fixed top-0 left-0 right-0 z-10 flex h-12 items-center gap-3 border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-950';
const MENU_BUTTON_CLASS =
  'cursor-pointer rounded-md p-1 text-gray-500 hover:bg-gray-50 hover:text-black dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white';
const OPEN_MENU_LABEL = 'Open menu';

export interface ComponentSandboxProps {
  title?: string;
  subtitle?: string;
  wrapInTheme?: boolean;
}

type BuildSidebarItemsArgs = {
  entries: SandboxEntry[];
  selectedId: string;
  onSelect: (id: string) => void;
  iconMode: boolean;
};

const buildSidebarItems = ({
  entries,
  selectedId,
  onSelect,
  iconMode,
}: BuildSidebarItemsArgs): SidebarCTA[] =>
  Object.values(CATEGORY)
    .map(category => ({
      category,
      items: entries.filter(entry => entry.category === category),
    }))
    .filter(group => group.items.length > 0)
    .map(group => ({
      id: group.category,
      label: group.category,
      icon: iconMode ? CATEGORY_ICON[group.category] : undefined,
      isActive: group.items.some(entry => entry.id === selectedId),
      children: group.items.map(entry => ({
        label: entry.label,
        isActive: entry.id === selectedId,
        onClick: () => onSelect(entry.id),
      })),
    }));

type BuildSettingsGroupArgs = {
  dark: boolean;
  onToggleDark?: () => void;
  iconMode: boolean;
  onToggleIconMode: () => void;
};

// Kept separate from buildSidebarItems - these are app-chrome toggles, not
// browsable demo content. Icons here are still gated by iconMode (not always
// on) so toggling it off leaves every item in the sidebar icon-less, which
// is what canCollapse/forceExpanded in Sidebar.tsx keys off of.
const buildSettingsGroup = ({
  dark,
  onToggleDark,
  iconMode,
  onToggleIconMode,
}: BuildSettingsGroupArgs): SidebarCTA => ({
  id: 'settings',
  label: SETTINGS_LABEL.GROUP,
  icon: iconMode ? SettingsIcon : undefined,
  children: [
    ...(onToggleDark
      ? [
          {
            label: dark
              ? SETTINGS_LABEL.DARK_MODE_ON
              : SETTINGS_LABEL.DARK_MODE_OFF,
            icon: iconMode ? (dark ? Sun : Moon) : undefined,
            onClick: onToggleDark,
          },
        ]
      : []),
    {
      label: iconMode
        ? SETTINGS_LABEL.ICON_MODE_ON
        : SETTINGS_LABEL.ICON_MODE_OFF,
      icon: iconMode ? Eye : undefined,
      onClick: onToggleIconMode,
    },
  ],
});

const SandboxEntryFrame = ({ entry }: { entry: SandboxEntry }) => (
  <section className="flex flex-col gap-3">
    <header className="flex flex-col gap-1">
      <Heading size="5" className="block">
        {entry.label}
      </Heading>
      <Text size="2" color="gray">
        {entry.description}
      </Text>
    </header>
    <div className={ENTRY_STAGE_CLASS}>{entry.content}</div>
  </section>
);

interface SandboxTopbarProps {
  title: string;
  onMenuClick: () => void;
}

const SandboxTopbar = ({ title, onMenuClick }: SandboxTopbarProps) => (
  <header className={TOPBAR_CLASS}>
    <button
      type="button"
      aria-label={OPEN_MENU_LABEL}
      onClick={onMenuClick}
      className={MENU_BUTTON_CLASS}
    >
      <Menu size={20} />
    </button>
    <Text weight="medium" size="3">
      {title}
    </Text>
  </header>
);

interface SandboxBodyProps {
  title?: string;
  subtitle?: string;
  dark: boolean;
  setDark: (v: boolean) => void;
  showThemeToggle: boolean;
}

const readStoredSelectedId = () => {
  const saved = localStorage.getItem(SELECTED_ID_STORAGE_KEY);
  return ALL_ENTRIES.some(entry => entry.id === saved)
    ? (saved as string)
    : ALL_ENTRIES[0].id;
};

const readStoredIconMode = () =>
  localStorage.getItem(ICON_MODE_STORAGE_KEY) === 'true';

const SandboxBody = ({
  title,
  subtitle,
  dark,
  setDark,
  showThemeToggle,
}: SandboxBodyProps) => {
  const [selectedId, setSelectedId] = useState(readStoredSelectedId);
  const [iconMode, setIconMode] = useState(readStoredIconMode);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const selectedEntry =
    ALL_ENTRIES.find(entry => entry.id === selectedId) ?? ALL_ENTRIES[0];

  const items = useMemo(
    () => [
      ...buildSidebarItems({
        entries: ALL_ENTRIES,
        selectedId,
        onSelect: id => {
          setSelectedId(id);
          localStorage.setItem(SELECTED_ID_STORAGE_KEY, id);
          setSidebarOpen(false);
        },
        iconMode,
      }),
      buildSettingsGroup({
        dark,
        onToggleDark: showThemeToggle ? () => setDark(!dark) : undefined,
        iconMode,
        onToggleIconMode: () => {
          const next = !iconMode;
          setIconMode(next);
          localStorage.setItem(ICON_MODE_STORAGE_KEY, String(next));
        },
      }),
    ],
    [selectedId, iconMode, dark, showThemeToggle, setDark],
  );

  return (
    <div className="h-full">
      <Sidebar
        items={items}
        searchable
        className={SIDEBAR_POSITION_CLASS}
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
        defaultOpenId={selectedEntry.category}
      />
      <SandboxTopbar
        title={title ?? selectedEntry.label}
        onMenuClick={() => setSidebarOpen(open => !open)}
      />
      <div
        className={`${CONTENT_WRAPPER_BASE_CLASS} ${iconMode ? CONTENT_WRAPPER_COLLAPSIBLE_CLASS : CONTENT_WRAPPER_FIXED_CLASS}`}
      >
        <div className="p-6 max-w-4xl">
          {title && (
            <Heading size="8" mb="2">
              {title}
            </Heading>
          )}
          {subtitle && (
            <Text color="gray" size="4" mb="6">
              {subtitle}
            </Text>
          )}
          <SandboxEntryFrame entry={selectedEntry} />
        </div>
      </div>
    </div>
  );
};

export function ComponentSandbox({
  title,
  subtitle,
  wrapInTheme = false,
}: ComponentSandboxProps): ReactNode {
  const [dark, setDark] = useState(false);

  if (!wrapInTheme) {
    return (
      <SandboxBody
        title={title}
        subtitle={subtitle}
        dark={dark}
        setDark={setDark}
        showThemeToggle={false}
      />
    );
  }

  const appearance = dark ? 'dark' : 'light';
  return (
    <Theme appearance={appearance}>
      <div className={`${appearance} w-full h-screen overflow-hidden`}>
        <SandboxBody
          title={title}
          subtitle={subtitle}
          dark={dark}
          setDark={setDark}
          showThemeToggle
        />
      </div>
    </Theme>
  );
}
