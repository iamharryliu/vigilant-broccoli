'use client';

import { useState, useEffect } from 'react';
import { Box, Heading, Text } from '@radix-ui/themes';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { ButtonDemo } from '../demos/ButtonDemo';
import { CollapsibleListItemDemo } from '../demos/CollapsibleListItemDemo';
import { CRUDListDemo } from '../demos/CRUDListDemo';
import { SelectDemo } from '../demos/SelectDemo';
import { ErrorDemo } from '../demos/ErrorDemo';

const STORAGE_KEY = 'component-sandbox-expanded';

const COMPONENT_SECTIONS = [
  {
    id: 'buttons',
    title: 'Buttons',
    component: ButtonDemo,
  },
  {
    id: 'collapsible-list-item',
    title: 'Collapsible List Item',
    component: CollapsibleListItemDemo,
  },
  {
    id: 'crud-list',
    title: 'CRUD List Management',
    component: CRUDListDemo,
  },
  {
    id: 'select',
    title: 'Select',
    component: SelectDemo,
  },
  {
    id: 'error',
    title: 'Error Handling',
    component: ErrorDemo,
  },
];

export function ComponentSandboxPage() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(),
  );
  const [enableTransitions, setEnableTransitions] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const initialState = stored
      ? new Set<string>(JSON.parse(stored) as string[])
      : new Set(['buttons']);

    requestAnimationFrame(() => {
      setEnableTransitions(true);
      setExpandedSections(initialState);
    });
  }, []);

  useEffect(() => {
    if (enableTransitions) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(Array.from(expandedSections)),
      );
    }
  }, [expandedSections, enableTransitions]);

  const toggleSection = (id: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSections(newExpanded);
  };

  return (
    <Box className="w-full min-h-screen">
      <div className="p-6 max-w-4xl mx-auto">
        <Heading size="8" mb="2">
          Component Sandbox
        </Heading>
        <Text color="gray" size="4" mb="6">
          Interactive component showcase and testing playground
        </Text>

        <div className="w-full space-y-2">
          {COMPONENT_SECTIONS.map(section => {
            const Component = section.component;
            const isExpanded = expandedSections.has(section.id);

            return (
              <div
                key={section.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                >
                  <Heading size="5">{section.title}</Heading>
                  <ChevronDownIcon
                    className={`transition-transform duration-300 ease-out ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                    width={20}
                    height={20}
                  />
                </button>

                <div
                  className={`overflow-hidden ${
                    enableTransitions
                      ? 'transition-all duration-300 ease-out'
                      : ''
                  }`}
                  style={{
                    maxHeight: isExpanded ? '1000px' : '0px',
                  }}
                >
                  <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                    <Component />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Box>
  );
}
