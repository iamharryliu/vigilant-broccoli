'use client';

import type { ReactNode } from 'react';
import { Select, Switch, Text } from '@vigilant-broccoli/react-lib';
import {
  ELEVENLABS_FREE_VOICE_OPTIONS,
  type LLMModel,
} from '@vigilant-broccoli/common-js';

export interface ChatSettingsProps {
  models: readonly LLMModel[];
  selectedModel: LLMModel;
  onModelChange: (model: LLMModel) => void;
  useKnowledgeBase: boolean;
  onUseKnowledgeBaseChange: (value: boolean) => void;
  speakReplies: boolean;
  onSpeakRepliesChange: (value: boolean) => void;
  voiceId: string;
  onVoiceIdChange: (value: string) => void;
}

const ASSISTANT_HEADING = 'Assistant';
const MODEL_LABEL = 'Model';
const KNOWLEDGE_BASE_LABEL = 'Knowledge base';
const VOICE_AGENT_HEADING = 'Voice agent';
const SPEAK_REPLIES_LABEL = 'Speak replies';
const VOICE_LABEL = 'Voice';
const VOICE_IDS = ELEVENLABS_FREE_VOICE_OPTIONS.map(v => v.value);

const formatModelLabel = (model: string) =>
  model
    .split('-')
    .map(part => part.toUpperCase())
    .join(' ');

const formatVoiceLabel = (id: string) =>
  ELEVENLABS_FREE_VOICE_OPTIONS.find(v => v.value === id)?.label ?? id;

export const ChatSettings = ({
  models,
  selectedModel,
  onModelChange,
  useKnowledgeBase,
  onUseKnowledgeBaseChange,
  speakReplies,
  onSpeakRepliesChange,
  voiceId,
  onVoiceIdChange,
}: ChatSettingsProps) => (
  <>
    <section className="flex flex-col gap-4">
      <Text size="2" weight="medium">
        {ASSISTANT_HEADING}
      </Text>
      <div className="flex flex-col gap-1.5">
        <Text size="1" color="gray">
          {MODEL_LABEL}
        </Text>
        <Select
          value={selectedModel}
          onValueChange={value => onModelChange(value as LLMModel)}
          options={[...models]}
          triggerClassName="w-full"
          renderItem={formatModelLabel}
        />
      </div>
      <label className="flex items-center justify-between gap-2">
        <Text size="2">{KNOWLEDGE_BASE_LABEL}</Text>
        <Switch
          checked={useKnowledgeBase}
          onCheckedChange={onUseKnowledgeBaseChange}
        />
      </label>
    </section>
    <section className="flex flex-col gap-4 border-t border-border pt-4">
      <Text size="2" weight="medium">
        {VOICE_AGENT_HEADING}
      </Text>
      <label className="flex items-center justify-between gap-2">
        <Text size="2">{SPEAK_REPLIES_LABEL}</Text>
        <Switch checked={speakReplies} onCheckedChange={onSpeakRepliesChange} />
      </label>
      <div className="flex flex-col gap-1.5">
        <Text size="1" color="gray">
          {VOICE_LABEL}
        </Text>
        <Select
          value={voiceId}
          onValueChange={onVoiceIdChange}
          options={VOICE_IDS}
          triggerClassName="w-full"
          renderItem={formatVoiceLabel}
        />
      </div>
    </section>
  </>
);

// Covers the chat panel without unmounting it, so an in-flight stream and draft survive.
export const ChatSettingsPage = ({ children }: { children: ReactNode }) => (
  <div className="absolute inset-0 z-[5] overflow-y-auto bg-background px-4 pb-8 pt-14">
    <div className="flex flex-col gap-4">{children}</div>
  </div>
);
