'use client';

import { useEffect, useState } from 'react';
import { Box, Heading, Switch, Text } from '@radix-ui/themes';
import { ButtonDemo } from '../demos/ButtonDemo';
import { CollapsibleListItemDemo } from '../demos/CollapsibleListItemDemo';
import { CRUDListNoImagesDemo } from '../demos/CRUDListNoImagesDemo';
import { CRUDListWithImagesDemo } from '../demos/CRUDListWithImagesDemo';
import { SelectDemo } from '../demos/SelectDemo';
import { ErrorDemo } from '../demos/ErrorDemo';
import {
  CollapsibleList,
  CollapsibleListItemConfig,
} from '../collapsible-list.component';

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
    setShowEllipsis(localStorage.getItem(CRUD_STORAGE_KEYS.SHOW_ELLIPSIS) !== 'false');
  }, []);
  return (
    <div className="space-y-8">
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <Switch checked={isCards} onCheckedChange={v => { setIsCards(v); localStorage.setItem(CRUD_STORAGE_KEYS.IS_CARDS, String(v)); }} />
          Cards
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <Switch checked={showEllipsis} onCheckedChange={v => { setShowEllipsis(v); localStorage.setItem(CRUD_STORAGE_KEYS.SHOW_ELLIPSIS, String(v)); }} />
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
];

export function ComponentSandboxPage() {
  return (
    <Box className="w-full min-h-screen">
      <div className="p-6 max-w-4xl mx-auto">
        <Heading size="8" mb="2">
          Component Sandbox
        </Heading>
        <Text color="gray" size="4" mb="6">
          Interactive component showcase and testing playground
        </Text>
        <CollapsibleList
          items={COMPONENT_SECTIONS}
          storageKeyPrefix={STORAGE_KEY}
        />
      </div>
    </Box>
  );
}
