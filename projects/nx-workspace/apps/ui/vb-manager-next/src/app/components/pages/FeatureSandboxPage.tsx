'use client';

import { Heading, Text } from '@radix-ui/themes';
import { ChatDemo } from '../demos/ChatDemo';
import { NotificationsDemo } from '../demos/NotificationsDemo';
import { StorageDemo } from '../demos/StorageDemo';
import { StripeDemo } from '../demos/StripeDemo';
import { MessagingPage } from './MessagingPage';
import { SpeechToText } from '../llm/SpeechToText';
import { VoiceListGenerator } from '../llm/VoiceListGenerator';
import { TextToSpeechVoices } from '../llm/TextToSpeechVoices';
import { LLMSimplePromptTester } from '../llm/LLMPromptTester';
import { RecipeScraperDemo } from '../llm/RecipeScraperDemo';
import { QRCodeGenerator } from '../demos/QRCodeGenerator';
import { LiveLocationsDemo } from '../demos/LiveLocationsDemo';
import {
  CollapsibleList,
  CollapsibleListItemConfig,
} from '@vigilant-broccoli/react-lib';

const STORAGE_KEY = 'feature-sandbox';

const FEATURE_SECTIONS: CollapsibleListItemConfig[] = [
  {
    id: 'live-locations',
    title: 'Live User Locations',
    content: <LiveLocationsDemo />,
  },
  {
    id: 'qr-code-generator',
    title: 'QR Code Generator',
    content: <QRCodeGenerator />,
  },
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
    id: 'text-to-speech-voices',
    title: 'Text to Speech',
    content: <TextToSpeechVoices />,
  },
  {
    id: 'llm-prompt-tester',
    title: 'LLM Prompt Tester',
    content: <LLMSimplePromptTester />,
  },
  {
    id: 'recipe-scraper',
    title: 'Recipe Scraper (URL or Image)',
    content: <RecipeScraperDemo />,
  },
  {
    id: 'bucket-demo',
    title: 'Storage Demo',
    content: <StorageDemo />,
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
  {
    id: 'chat',
    title: 'Chat Demo (Socket.IO)',
    content: <ChatDemo />,
  },
  {
    id: 'notifications-demo',
    title: 'Notifications Demo',
    content: <NotificationsDemo />,
  },
];

export function FeatureSandboxPage() {
  return (
    <div className="w-full min-h-screen">
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
    </div>
  );
}
