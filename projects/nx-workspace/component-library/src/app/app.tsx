import { useEffect, useState } from 'react';
import { Box, Heading, Switch, Text, Flex, Theme } from '@radix-ui/themes';
import { Moon, Sun } from 'lucide-react';
import { ButtonDemo } from './components/demos/ButtonDemo';
import { CollapsibleListItemDemo } from './components/demos/CollapsibleListItemDemo';
import { CRUDListNoImagesDemo } from './components/demos/CRUDListNoImagesDemo';
import { CRUDListWithImagesDemo } from './components/demos/CRUDListWithImagesDemo';
import { SelectDemo } from './components/demos/SelectDemo';
import { ErrorDemo } from './components/demos/ErrorDemo';
import { StatusCardListDemo } from './components/demos/StatusCardListDemo';
import {
  CollapsibleList,
  CollapsibleListItemConfig,
} from '@vigilant-broccoli/react-lib';

const STORAGE_KEY = 'component-sandbox';
const CRUD_STORAGE_KEYS = {
  IS_CARDS: `${STORAGE_KEY}-crud-is-cards`,
  SHOW_ELLIPSIS: `${STORAGE_KEY}-crud-show-ellipsis`,
};

const CRUDListSection = () => {
  const [isCards, setIsCards] = useState(false);
  const [showEllipsis, setShowEllipsis] = useState(true);

  useEffect(() => {
    setIsCards(localStorage.getItem(CRUD_STORAGE_KEYS.IS_CARDS) === 'true');
    setShowEllipsis(
      localStorage.getItem(CRUD_STORAGE_KEYS.SHOW_ELLIPSIS) !== 'false',
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
          Cards
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <Switch
            checked={showEllipsis}
            onCheckedChange={v => {
              setShowEllipsis(v);
              localStorage.setItem(CRUD_STORAGE_KEYS.SHOW_ELLIPSIS, String(v));
            }}
          />
          Ellipsis
        </label>
      </div>
      <CRUDListNoImagesDemo isCards={isCards} showEllipsis={showEllipsis} />
      <CRUDListWithImagesDemo isCards={isCards} showEllipsis={showEllipsis} />
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
    id: 'collapsible-list-chevron-left',
    title: 'Collapsible List (Chevron Left)',
    content: (
      <CollapsibleList
        chevronPosition="left"
        items={[
          {
            id: 'a',
            title: 'Item A',
            content: <span>Content for item A</span>,
          },
          {
            id: 'b',
            title: 'Item B',
            content: <span>Content for item B</span>,
            defaultOpen: true,
          },
          {
            id: 'c',
            title: 'Item C',
            content: <span>Content for item C</span>,
          },
        ]}
      />
    ),
  },
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
          <CollapsibleList
            items={COMPONENT_SECTIONS}
            storageKeyPrefix={STORAGE_KEY}
          />
        </div>
      </Box>
    </Theme>
  );
}

export default App;
