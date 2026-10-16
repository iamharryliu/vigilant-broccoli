'use client';

import { ChatDemo } from '../demos/ChatDemo';
import { NotificationsDemo } from '../demos/NotificationsDemo';
import { StorageDemo } from '../demos/StorageDemo';
import { StripeDemo } from '../demos/StripeDemo';
import { TextMessageForm } from './TextMessageForm';
import { EmailMessageForm } from '../EmailMessageForm';
import { SpeechToText } from '../llm/SpeechToText';
import { VoiceListGenerator } from '../llm/VoiceListGenerator';
import { TextToSpeechVoices } from '../llm/TextToSpeechVoices';
import { LLMSimplePromptTester } from '../llm/LLMPromptTester';
import { RecipeScraperDemo } from '../llm/RecipeScraperDemo';
import { QRCodeGenerator } from '../demos/QRCodeGenerator';
import { LiveLocationsDemo } from '../demos/LiveLocationsDemo';
import { NotepadEditorDemo } from '../demos/NotepadEditorDemo';
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
    id: 'notepad-editor',
    title: 'Notepad Editor (VSCode-style editing)',
    content: <NotepadEditorDemo />,
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
    id: 'send-email-message',
    title: 'Send Email Message',
    content: <EmailMessageForm />,
  },
  {
    id: 'send-text-message',
    title: 'Send Text Message',
    content: <TextMessageForm />,
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
    <div className="max-w-4xl mx-auto">
      <CollapsibleList
        items={FEATURE_SECTIONS}
        storageKeyPrefix={STORAGE_KEY}
      />
    </div>
  );
}
