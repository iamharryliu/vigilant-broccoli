'use client';

import { Box, Heading, Text } from '@radix-ui/themes';
import { BucketDemo } from '../demos/BucketDemo';
import { StripeDemo } from '../demos/StripeDemo';
import { MessagingPage } from './MessagingPage';
import { SpeechToText } from '../llm/SpeechToText';
import { VoiceListGenerator } from '../llm/VoiceListGenerator';
import {
  CollapsibleList,
  CollapsibleListItemConfig,
} from '@vigilant-broccoli/react-lib';

const STORAGE_KEY = 'feature-sandbox';

const FEATURE_SECTIONS: CollapsibleListItemConfig[] = [
  {
    id: 'speech-to-text',
    title: 'Speech to Text (Streaming)',
    content: <SpeechToText />,
  },
  {
    id: 'audio-transcriber',
    title: 'Speech to Text (Complete)',
    content: <SpeechToText mode="complete" />,
  },
  {
    id: 'voice-list-generator',
    title: 'Voice List Generator',
    content: <VoiceListGenerator />,
  },
  {
    id: 'bucket-demo',
    title: 'Bucket Demo',
    content: <BucketDemo />,
    defaultOpen: true,
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
