import { ReactNode, useEffect, useMemo, useState } from 'react';
import { Theme } from '@radix-ui/themes';
import Fuse from 'fuse.js';
import { Search } from 'lucide-react';
import {
  DarkModeIconButton,
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
    id: 'buttons',
    label: 'Buttons',
    category: CATEGORY.COMPONENTS,
    content: <ButtonDemo />,
  },
  {
    id: 'avatar',
    label: 'Avatar',
    category: CATEGORY.COMPONENTS,
    content: <AvatarDemo />,
  },
  {
    id: 'user-avatar',
    label: 'User Avatar',
    category: CATEGORY.COMPONENTS,
    content: <UserAvatarDemo />,
  },
  {
    id: 'status-card-list',
    label: 'Status Card List',
    category: CATEGORY.COMPONENTS,
    content: <StatusCardListDemo />,
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
    id: 'select',
    label: 'Select',
    category: CATEGORY.COMPONENTS,
    content: <SelectDemo />,
  },
  {
    id: 'error',
    label: 'Error Handling',
    category: CATEGORY.COMPONENTS,
    content: <ErrorDemo />,
  },
  {
    id: 'tabs',
    label: 'Tabs',
    category: CATEGORY.COMPONENTS,
    content: <TabsDemo />,
  },
  {
    id: 'switch',
    label: 'Switch',
    category: CATEGORY.COMPONENTS,
    content: <SwitchDemo />,
  },
  {
    id: 'tooltip',
    label: 'Tooltip',
    category: CATEGORY.COMPONENTS,
    content: <TooltipDemo />,
  },
  {
    id: 'toaster',
    label: 'Toaster',
    category: CATEGORY.COMPONENTS,
    content: <ToasterDemo />,
  },
  {
    id: 'github-actions-badges',
    label: 'GitHub Actions Badges',
    category: CATEGORY.COMPONENTS,
    content: <GithubActionsBadgesDemo />,
  },
  {
    id: 'user-leaderboard',
    label: 'User Leaderboard',
    category: CATEGORY.COMPONENTS,
    content: <UserLeaderboardDemo />,
  },
  {
    id: 'group-leaderboard',
    label: 'Group Leaderboard',
    category: CATEGORY.COMPONENTS,
    content: <GroupLeaderboardDemo />,
  },
  {
    id: 'empty-leaderboard',
    label: 'Empty Leaderboard',
    category: CATEGORY.COMPONENTS,
    content: <EmptyLeaderboardDemo />,
  },
  {
    id: 'scroll-timeline',
    label: 'Scroll Timeline',
    category: CATEGORY.COMPONENTS,
    content: <ScrollTimelineDemo />,
  },
];

const UTILITY_ENTRIES: SandboxEntry[] = [
  {
    id: 'calculator',
    label: 'Calculator',
    category: CATEGORY.UTILITIES,
    content: <CalculatorUtilityContent />,
  },
  {
    id: 'currency-converter',
    label: 'Currency Converter',
    category: CATEGORY.UTILITIES,
    content: <CurrencyConverterUtilityContent />,
  },
  {
    id: 'cooking-conversions',
    label: 'Cooking Conversions',
    category: CATEGORY.UTILITIES,
    content: <CookingConversionsUtilityContent />,
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
  {
    id: 'alarm',
    label: 'Alarm',
    category: CATEGORY.UTILITIES,
    content: <AlarmUtilityContent />,
  },
];

const ALL_ENTRIES: SandboxEntry[] = [...COMPONENT_ENTRIES, ...UTILITY_ENTRIES];
const FUSE_OPTIONS = { keys: ['label'], threshold: 0.3 };

export interface ComponentSandboxProps {
  title?: string;
  subtitle?: string;
  wrapInTheme?: boolean;
}

interface SandboxSidebarProps {
  query: string;
  onQueryChange: (v: string) => void;
  entries: SandboxEntry[];
  selectedId: string;
  onSelect: (id: string) => void;
}

const SandboxSidebar = ({
  query,
  onQueryChange,
  entries,
  selectedId,
  onSelect,
}: SandboxSidebarProps) => {
  const groups = useMemo(
    () =>
      Object.values(CATEGORY)
        .map(category => ({
          category,
          items: entries.filter(entry => entry.category === category),
        }))
        .filter(group => group.items.length > 0),
    [entries],
  );

  return (
    <nav className="w-64 shrink-0 h-full border-r border-gray-300 dark:border-gray-700 flex flex-col">
      <div className="p-3 border-b border-gray-300 dark:border-gray-700">
        <div className="flex items-center gap-2 rounded-md border border-gray-300 dark:border-gray-700 px-2 py-1.5">
          <Search className="h-4 w-4 text-gray-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={e => onQueryChange(e.target.value)}
            placeholder="Search components..."
            className="w-full bg-transparent outline-none text-sm placeholder-gray-400 dark:text-white"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {groups.length === 0 && (
          <Text color="gray" size="2" className="block px-2 py-4">
            No components found
          </Text>
        )}
        {groups.map(group => (
          <div key={group.category} className="mb-4">
            <div className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
              {group.category}
            </div>
            {group.items.map(entry => (
              <button
                key={entry.id}
                type="button"
                onClick={() => onSelect(entry.id)}
                className={`w-full text-left text-sm rounded-md px-2 py-1.5 transition-colors ${
                  entry.id === selectedId
                    ? 'font-medium text-black bg-gray-100 dark:text-white dark:bg-gray-800'
                    : 'text-gray-500 dark:text-gray-400 hover:text-black hover:bg-gray-50 dark:hover:text-white dark:hover:bg-gray-800'
                }`}
              >
                {entry.label}
              </button>
            ))}
          </div>
        ))}
      </div>
    </nav>
  );
};

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
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(ALL_ENTRIES[0].id);
  const fuse = useMemo(() => new Fuse(ALL_ENTRIES, FUSE_OPTIONS), []);

  const filteredEntries = query.trim()
    ? fuse.search(query.trim()).map(result => result.item)
    : ALL_ENTRIES;
  const selectedEntry =
    ALL_ENTRIES.find(entry => entry.id === selectedId) ?? ALL_ENTRIES[0];

  return (
    <div className="flex h-full">
      <SandboxSidebar
        query={query}
        onQueryChange={setQuery}
        entries={filteredEntries}
        selectedId={selectedId}
        onSelect={id => {
          setSelectedId(id);
          setQuery('');
        }}
      />
      <div className="flex-1 h-full overflow-y-auto">
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
