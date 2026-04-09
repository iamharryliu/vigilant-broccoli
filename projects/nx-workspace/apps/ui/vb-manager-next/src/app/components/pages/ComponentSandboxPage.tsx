'use client';

import { Box, Heading, Text } from '@radix-ui/themes';
import { ButtonDemo } from '../demos/ButtonDemo';
import { CollapsibleListItemDemo } from '../demos/CollapsibleListItemDemo';
import { CRUDListDemo } from '../demos/CRUDListDemo';
import { SelectDemo } from '../demos/SelectDemo';
import { ErrorDemo } from '../demos/ErrorDemo';
import {
  CollapsibleList,
  CollapsibleListItemConfig,
} from '../collapsible-list.component';

const STORAGE_KEY = 'component-sandbox';

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
    content: <CRUDListDemo />,
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
