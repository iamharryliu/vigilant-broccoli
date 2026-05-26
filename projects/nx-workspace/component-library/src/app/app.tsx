import { useEffect, useState } from 'react';
import { Box, Heading, Text, Flex, Theme } from '@radix-ui/themes';
import { Switch } from '@vigilant-broccoli/react-lib';
import { Moon, Sun } from 'lucide-react';
import { AvatarDemo } from './components/demos/AvatarDemo';
import { UserAvatarDemo } from './components/demos/UserAvatarDemo';
import { ButtonDemo } from './components/demos/ButtonDemo';
import { CollapsibleListItemDemo } from './components/demos/CollapsibleListItemDemo';
import { CRUDListNoImagesDemo } from './components/demos/CRUDListNoImagesDemo';
import { CRUDListWithImagesDemo } from './components/demos/CRUDListWithImagesDemo';
import { SelectDemo } from './components/demos/SelectDemo';
import { ErrorDemo } from './components/demos/ErrorDemo';
import { StatusCardListDemo } from './components/demos/StatusCardListDemo';
import { TabsDemo } from './components/demos/TabsDemo';
import { SwitchDemo } from './components/demos/SwitchDemo';
import {
  CollapsibleList,
  CollapsibleListItemConfig,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@vigilant-broccoli/react-lib';
import {
  AlarmUtilityContent,
  CalculatorUtilityContent,
  CookingConversionsUtilityContent,
  CurrencyConverterUtilityContent,
  StopwatchUtilityContent,
  TimerUtilityContent,
} from '@vigilant-broccoli/react-utility';

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
              localStorage.setItem(CRUD_STORAGE_KEYS.FULL_WIDTH_IMAGE, String(v));
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
  {
    id: 'avatar',
    title: 'Avatar',
    content: <AvatarDemo />,
  },
  {
    id: 'user-avatar',
    title: 'User Avatar',
    content: <UserAvatarDemo />,
  },
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
  {
    id: 'select',
    title: 'Select',
    content: <SelectDemo />,
  },
  {
    id: 'error',
    title: 'Error Handling',
    content: <ErrorDemo />,
  },
  {
    id: 'tabs',
    title: 'Tabs',
    content: <TabsDemo />,
  },
  {
    id: 'switch',
    title: 'Switch',
    content: <SwitchDemo />,
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

export function App() {
  const [dark, setDark] = useState(false);
  const appearance = dark ? 'dark' : 'light';

  return (
    <Theme appearance={appearance}>
      <Box className={`${appearance} w-full min-h-screen`}>
        <div className="p-6 max-w-4xl mx-auto">
          <Flex justify="between" align="center" mb="2">
            <Heading size="8">Component Sandbox</Heading>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Sun size={14} />
              <Switch checked={dark} onCheckedChange={setDark} />
              <Moon size={14} />
            </label>
          </Flex>
          <Text color="gray" size="4" mb="6">
            Interactive component showcase and testing playground
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
      </Box>
    </Theme>
  );
}

export default App;
