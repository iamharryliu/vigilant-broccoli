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

const SettingsSection = ({
  heading,
  hasDivider = false,
  children,
}: {
  heading: string;
  hasDivider?: boolean;
  children: ReactNode;
}) => (
  <section
    className={`flex flex-col gap-5 ${hasDivider ? 'border-t border-border pt-10' : ''}`}
  >
    <Text size="5" weight="bold">
      {heading}
    </Text>
    {children}
  </section>
);

const SettingsField = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => (
  <div className="flex items-center justify-between gap-4">
    <Text size="3">{label}</Text>
    {children}
  </div>
);

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
    <SettingsSection heading={ASSISTANT_HEADING}>
      <SettingsField label={MODEL_LABEL}>
        <Select
          value={selectedModel}
          onValueChange={value => onModelChange(value as LLMModel)}
          options={[...models]}
          triggerClassName="w-64"
          renderItem={formatModelLabel}
        />
      </SettingsField>
      <label className="flex items-center justify-between gap-4">
        <Text size="3">{KNOWLEDGE_BASE_LABEL}</Text>
        <Switch
          checked={useKnowledgeBase}
          onCheckedChange={onUseKnowledgeBaseChange}
        />
      </label>
    </SettingsSection>
    <SettingsSection heading={VOICE_AGENT_HEADING} hasDivider>
      <label className="flex items-center justify-between gap-4">
        <Text size="3">{SPEAK_REPLIES_LABEL}</Text>
        <Switch checked={speakReplies} onCheckedChange={onSpeakRepliesChange} />
      </label>
      <SettingsField label={VOICE_LABEL}>
        <Select
          value={voiceId}
          onValueChange={onVoiceIdChange}
          options={VOICE_IDS}
          triggerClassName="w-64"
          renderItem={formatVoiceLabel}
        />
      </SettingsField>
    </SettingsSection>
  </>
);

// Covers the chat panel without unmounting it, so an in-flight stream and draft survive.
export const ChatSettingsPage = ({ children }: { children: ReactNode }) => (
  <div className="absolute inset-0 z-[5] overflow-y-auto bg-background px-6 pb-12 pt-16">
    <div className="flex flex-col gap-10">{children}</div>
  </div>
);
