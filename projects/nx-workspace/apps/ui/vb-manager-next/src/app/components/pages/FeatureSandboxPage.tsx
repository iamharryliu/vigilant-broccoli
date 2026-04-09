'use client';

import { Box, Heading, Text } from '@radix-ui/themes';
import { BucketDemo } from '../demos/BucketDemo';
import { ChoresDemo } from '../demos/ChoresDemo';
import { StripeDemo } from '../demos/StripeDemo';
import { MessagingPage } from './MessagingPage';
import { CalendarDemo } from '../demos/CalendarDemo';
import { FullCalendarDemo } from '../demos/FullCalendarDemo';
import {
  CollapsibleList,
  CollapsibleListItemConfig,
} from '../collapsible-list.component';

const STORAGE_KEY = 'feature-sandbox';

const FEATURE_SECTIONS: CollapsibleListItemConfig[] = [
  {
    id: 'bucket-demo',
    title: 'Bucket Demo',
    content: <BucketDemo />,
    defaultOpen: true,
  },
  {
    id: 'chores-demo',
    title: 'Chores Demo',
    content: <ChoresDemo />,
  },
  {
    id: 'stripe-demo',
    title: 'Stripe Demo',
    content: <StripeDemo />,
  },
  {
    id: 'messaging',
    title: 'Messaging Demo',
    content: <MessagingPage />,
  },
  {
    id: 'calendar',
    title: 'Calendar - Doggo Tracker',
    content: <CalendarDemo />,
  },
  {
    id: 'fullcalendar',
    title: 'FullCalendar Views',
    content: <FullCalendarDemo />,
  },
];

export function FeatureSandboxPage() {
  return (
    <Box className="w-full min-h-screen">
      <div className="p-6 max-w-4xl mx-auto">
        <Heading size="8" mb="2">
          Feature Sandbox
        </Heading>
        <Text color="gray" size="4" mb="6">
          Interactive feature demonstrations and testing playground
        </Text>
        <CollapsibleList
          items={FEATURE_SECTIONS}
          storageKeyPrefix={STORAGE_KEY}
        />
      </div>
    </Box>
  );
}
