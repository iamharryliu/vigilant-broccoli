import { ReactNode, useEffect, useMemo, useState } from 'react';
import { Theme } from '@radix-ui/themes';
import { Menu } from 'lucide-react';
import {
  DarkModeIconButton,
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
import { CRUDListWithImagesDemo } from './demos/CRUDListWithImagesDemo';
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
import { ScrollTimelineDemo } from './demos/ScrollTimelineDemo';

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

const DEFAULT_TITLE = 'Component Sandbox';
const DEFAULT_SUBTITLE =
  'Interactive component showcase and testing playground';

const CATEGORY = {
  COMPONENTS: 'Components',
  UTILITIES: 'Utilities',
} as const;
type Category = (typeof CATEGORY)[keyof typeof CATEGORY];

interface SandboxEntry {
  id: string;
  label: string;
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
    category: CATEGORY.COMPONENTS,
    content: <AvatarDemo />,
  },
  {
    id: 'buttons',
    label: 'Buttons',
    category: CATEGORY.COMPONENTS,
    content: <ButtonDemo />,
  },
  {
    id: 'collapsible-list-item',
    label: 'Collapsible List Item',
    category: CATEGORY.COMPONENTS,
    content: <CollapsibleListItemDemo />,
  },
  {
    id: 'crud-list',
    label: 'CRUD List Management',
    category: CATEGORY.COMPONENTS,
    content: <CRUDListSection />,
  },
  {
    id: 'empty-leaderboard',
    label: 'Empty Leaderboard',
    category: CATEGORY.COMPONENTS,
    content: <EmptyLeaderboardDemo />,
  },
  {
    id: 'error',
    label: 'Error Handling',
    category: CATEGORY.COMPONENTS,
    content: <ErrorDemo />,
  },
  {
    id: 'github-actions-badges',
    label: 'GitHub Actions Badges',
    category: CATEGORY.COMPONENTS,
    content: <GithubActionsBadgesDemo />,
  },
  {
    id: 'group-leaderboard',
    label: 'Group Leaderboard',
    category: CATEGORY.COMPONENTS,
    content: <GroupLeaderboardDemo />,
  },
  {
    id: 'scroll-timeline',
    label: 'Scroll Timeline',
    category: CATEGORY.COMPONENTS,
    content: <ScrollTimelineDemo />,
  },
  {
    id: 'select',
    label: 'Select',
    category: CATEGORY.COMPONENTS,
    content: <SelectDemo />,
  },
  {
    id: 'status-card-list',
    label: 'Status Card List',
    category: CATEGORY.COMPONENTS,
    content: <StatusCardListDemo />,
  },
  {
    id: 'switch',
    label: 'Switch',
    category: CATEGORY.COMPONENTS,
    content: <SwitchDemo />,
  },
  {
    id: 'tabs',
    label: 'Tabs',
    category: CATEGORY.COMPONENTS,
    content: <TabsDemo />,
  },
  {
    id: 'toaster',
    label: 'Toaster',
    category: CATEGORY.COMPONENTS,
    content: <ToasterDemo />,
  },
  {
    id: 'tooltip',
    label: 'Tooltip',
    category: CATEGORY.COMPONENTS,
    content: <TooltipDemo />,
  },
  {
    id: 'user-avatar',
    label: 'User Avatar',
    category: CATEGORY.COMPONENTS,
    content: <UserAvatarDemo />,
  },
  {
    id: 'user-leaderboard',
    label: 'User Leaderboard',
    category: CATEGORY.COMPONENTS,
    content: <UserLeaderboardDemo />,
  },
];

const UTILITY_ENTRIES: SandboxEntry[] = [
  {
    id: 'alarm',
    label: 'Alarm',
    category: CATEGORY.UTILITIES,
    content: <AlarmUtilityContent />,
  },
  {
    id: 'calculator',
    label: 'Calculator',
    category: CATEGORY.UTILITIES,
    content: <CalculatorUtilityContent />,
  },
  {
    id: 'cooking-conversions',
    label: 'Cooking Conversions',
    category: CATEGORY.UTILITIES,
    content: <CookingConversionsUtilityContent />,
  },
  {
    id: 'currency-converter',
    label: 'Currency Converter',
    category: CATEGORY.UTILITIES,
    content: <CurrencyConverterUtilityContent />,
  },
  {
    id: 'stopwatch',
    label: 'Stopwatch',
    category: CATEGORY.UTILITIES,
    content: <StopwatchUtilityContent />,
  },
  {
    id: 'timer',
    label: 'Timer',
    category: CATEGORY.UTILITIES,
    content: <TimerUtilityContent />,
  },
];

const ALL_ENTRIES: SandboxEntry[] = [...COMPONENT_ENTRIES, ...UTILITY_ENTRIES];

const SIDEBAR_POSITION_CLASS = 'fixed top-0 left-0 bottom-0 z-30 peer';
const CONTENT_WRAPPER_CLASS =
  'h-full overflow-y-auto pt-12 md:pt-0 pl-0 md:pl-14 md:peer-hover:pl-48 transition-[padding] duration-200';
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
};

const buildSidebarItems = ({
  entries,
  selectedId,
  onSelect,
}: BuildSidebarItemsArgs): SidebarCTA[] =>
  Object.values(CATEGORY)
    .map(category => ({
      category,
      items: entries.filter(entry => entry.category === category),
    }))
    .filter(group => group.items.length > 0)
    .map(group => ({
      label: group.category,
      isActive: group.items.some(entry => entry.id === selectedId),
      children: group.items.map(entry => ({
        label: entry.label,
        isActive: entry.id === selectedId,
        onClick: () => onSelect(entry.id),
      })),
    }));

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
  title: string;
  subtitle: string;
  dark: boolean;
  setDark: (v: boolean) => void;
  showThemeToggle: boolean;
}

const SandboxBody = ({
  title,
  subtitle,
  dark,
  setDark,
  showThemeToggle,
}: SandboxBodyProps) => {
  const [selectedId, setSelectedId] = useState(ALL_ENTRIES[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const selectedEntry =
    ALL_ENTRIES.find(entry => entry.id === selectedId) ?? ALL_ENTRIES[0];

  const items = useMemo(
    () =>
      buildSidebarItems({
        entries: ALL_ENTRIES,
        selectedId,
        onSelect: id => {
          setSelectedId(id);
          setSidebarOpen(false);
        },
      }),
    [selectedId],
  );

  return (
    <div className="h-full">
      <Sidebar
        items={items}
        searchable
        className={SIDEBAR_POSITION_CLASS}
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />
      <SandboxTopbar
        title={title}
        onMenuClick={() => setSidebarOpen(open => !open)}
      />
      <div className={CONTENT_WRAPPER_CLASS}>
        <div className="p-6 max-w-4xl">
          <div className="flex justify-between items-center mb-2">
            <Heading size="8">{title}</Heading>
            {showThemeToggle && (
              <DarkModeIconButton dark={dark} onToggle={setDark} />
            )}
          </div>
          <Text color="gray" size="4" mb="6">
            {subtitle}
          </Text>
          <Heading size="5" mb="4" className="block">
            {selectedEntry.label}
          </Heading>
          <div className="flex flex-col gap-3">{selectedEntry.content}</div>
        </div>
      </div>
    </div>
  );
};

export function ComponentSandbox({
  title = DEFAULT_TITLE,
  subtitle = DEFAULT_SUBTITLE,
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
