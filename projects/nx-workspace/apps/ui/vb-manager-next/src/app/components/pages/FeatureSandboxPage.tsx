'use client';

import { useState, useEffect } from 'react';
import { Box, Heading, Text } from '@radix-ui/themes';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { BucketDemo } from '../demos/BucketDemo';
import { ChoresDemo } from '../demos/ChoresDemo';
import { StripeDemo } from '../demos/StripeDemo';
import { MessagingPage } from './MessagingPage';
import { CalendarDemo } from '../demos/CalendarDemo';
import { FullCalendarDemo } from '../demos/FullCalendarDemo';

const STORAGE_KEY = 'feature-sandbox-expanded';

const FEATURE_SECTIONS = [
  {
    id: 'bucket-demo',
    title: 'Bucket Demo',
    component: BucketDemo,
  },
  {
    id: 'chores-demo',
    title: 'Chores Demo',
    component: ChoresDemo,
  },
  {
    id: 'stripe-demo',
    title: 'Stripe Demo',
    component: StripeDemo,
  },
  {
    id: 'messaging',
    title: 'Messaging Demo',
    component: MessagingPage,
  },
  {
    id: 'calendar',
    title: 'Calendar - Doggo Tracker',
    component: CalendarDemo,
  },
  {
    id: 'fullcalendar',
    title: 'FullCalendar Views',
    component: FullCalendarDemo,
  },
];

export function FeatureSandboxPage() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(),
  );
  const [enableTransitions, setEnableTransitions] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const initialState = stored
      ? new Set<string>(JSON.parse(stored) as string[])
      : new Set(['bucket-demo']);

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
          Feature Sandbox
        </Heading>
        <Text color="gray" size="4" mb="6">
          Interactive feature demonstrations and testing playground
        </Text>

        <div className="w-full space-y-2">
          {FEATURE_SECTIONS.map(section => {
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
                    maxHeight: isExpanded ? '5000px' : '0px',
                  }}
                >
                  <div className="border-t border-gray-200 dark:border-gray-700">
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
