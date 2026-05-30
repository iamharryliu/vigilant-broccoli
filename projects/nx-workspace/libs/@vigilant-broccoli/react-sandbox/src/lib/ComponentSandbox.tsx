import { ReactNode, useEffect, useState } from 'react';
import { Box, Heading, Text, Flex, Theme } from '@radix-ui/themes';
import {
  CollapsibleList,
  CollapsibleListItemConfig,
  DarkModeIconButton,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
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
import { SwitchDemo } from './demos/SwitchDemo';
import { ToasterDemo } from './demos/ToasterDemo';

const STORAGE_KEY = 'component-sandbox';
const STORAGE_KEY_UTILITIES = `${STORAGE_KEY}-utilities`;
const CRUD_STORAGE_KEYS = {
  IS_CARDS: `${STORAGE_KEY}-crud-is-cards`,
  SHOW_ELLIPSIS: `${STORAGE_KEY}-crud-show-ellipsis`,
  FULL_WIDTH_IMAGE: `${STORAGE_KEY}-crud-full-width-image`,
};

const CRUD_SWITCH_LABEL = {
  CARDS: 'Cards',
  ELLIPSIS: 'Ellipsis',
  FULL_WIDTH_IMAGE: 'Full-width image',
} as const;
const TAB = { COMPONENTS: 'components', UTILITIES: 'utilities' } as const;

const DEFAULT_TITLE = 'Component Sandbox';
const DEFAULT_SUBTITLE =
  'Interactive component showcase and testing playground';

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

const COMPONENT_SECTIONS: CollapsibleListItemConfig[] = [
  {
    id: 'buttons',
    title: 'Buttons',
    content: <ButtonDemo />,
    defaultOpen: true,
  },
  { id: 'avatar', title: 'Avatar', content: <AvatarDemo /> },
  { id: 'user-avatar', title: 'User Avatar', content: <UserAvatarDemo /> },
  {
    id: 'status-card-list',
    title: 'Status Card List',
    content: <StatusCardListDemo />,
  },
  {
    id: 'collapsible-list-item',
    title: 'Collapsible List Item',
    content: <CollapsibleListItemDemo />,
  },
  {
    id: 'crud-list',
    title: 'CRUD List Management',
    content: <CRUDListSection />,
  },
  { id: 'select', title: 'Select', content: <SelectDemo /> },
  { id: 'error', title: 'Error Handling', content: <ErrorDemo /> },
  { id: 'tabs', title: 'Tabs', content: <TabsDemo /> },
  { id: 'switch', title: 'Switch', content: <SwitchDemo /> },
  { id: 'toaster', title: 'Toaster', content: <ToasterDemo /> },
  {
    id: 'github-actions-badges',
    title: 'GitHub Actions Badges',
    content: <GithubActionsBadgesDemo />,
  },
];

const UTILITY_SECTIONS: CollapsibleListItemConfig[] = [
  {
    id: 'calculator',
    title: 'Calculator',
    content: <CalculatorUtilityContent />,
  },
  {
    id: 'currency-converter',
    title: 'Currency Converter',
    content: <CurrencyConverterUtilityContent />,
  },
  {
    id: 'cooking-conversions',
    title: 'Cooking Conversions',
    content: <CookingConversionsUtilityContent />,
  },
  { id: 'stopwatch', title: 'Stopwatch', content: <StopwatchUtilityContent /> },
  { id: 'timer', title: 'Timer', content: <TimerUtilityContent /> },
  { id: 'alarm', title: 'Alarm', content: <AlarmUtilityContent /> },
];

export interface ComponentSandboxProps {
  title?: string;
  subtitle?: string;
  wrapInTheme?: boolean;
}

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
}: SandboxBodyProps) => (
  <div className="p-6 max-w-4xl mx-auto">
    <Flex justify="between" align="center" mb="2">
      <Heading size="8">{title}</Heading>
      {showThemeToggle && <DarkModeIconButton dark={dark} onToggle={setDark} />}
    </Flex>
    <Text color="gray" size="4" mb="6">
      {subtitle}
    </Text>
    <Tabs defaultValue={TAB.COMPONENTS}>
      <TabsList className="mb-4">
        <TabsTrigger value={TAB.COMPONENTS}>Components</TabsTrigger>
        <TabsTrigger value={TAB.UTILITIES}>Utilities</TabsTrigger>
      </TabsList>
      <TabsContent value={TAB.COMPONENTS}>
        <CollapsibleList
          items={COMPONENT_SECTIONS}
          storageKeyPrefix={STORAGE_KEY}
        />
      </TabsContent>
      <TabsContent value={TAB.UTILITIES}>
        <CollapsibleList
          items={UTILITY_SECTIONS}
          storageKeyPrefix={STORAGE_KEY_UTILITIES}
        />
      </TabsContent>
    </Tabs>
  </div>
);

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
      <Box className={`${appearance} w-full min-h-screen`}>
        <SandboxBody
          title={title}
          subtitle={subtitle}
          dark={dark}
          setDark={setDark}
          showThemeToggle
        />
      </Box>
    </Theme>
  );
}
