'use client';

import { Select, Switch, Text } from '@vigilant-broccoli/react-lib';
import type { LLMModel } from '@vigilant-broccoli/common-js';
import { CHAT_MODELS } from '../app.const';

const MODEL_LABEL = 'Model';
const KNOWLEDGE_BASE_LABEL = 'Knowledge base';
const SPEAK_REPLIES_LABEL = 'Speak replies';

const formatModelLabel = (model: string) =>
  model
    .split('-')
    .map(part => part.toUpperCase())
    .join(' ');

export const ChatSettings = ({
  selectedModel,
  onModelChange,
  useKnowledgeBase,
  onUseKnowledgeBaseChange,
  speakReplies,
  onSpeakRepliesChange,
}: {
  selectedModel: LLMModel;
  onModelChange: (model: LLMModel) => void;
  useKnowledgeBase: boolean;
  onUseKnowledgeBaseChange: (value: boolean) => void;
  speakReplies: boolean;
  onSpeakRepliesChange: (value: boolean) => void;
}) => (
  <>
    <div className="flex flex-col gap-1.5">
      <Text size="1" color="gray">
        {MODEL_LABEL}
      </Text>
      <Select
        value={selectedModel}
        onValueChange={value => onModelChange(value as LLMModel)}
        options={CHAT_MODELS}
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
    <label className="flex items-center justify-between gap-2">
      <Text size="2">{SPEAK_REPLIES_LABEL}</Text>
      <Switch checked={speakReplies} onCheckedChange={onSpeakRepliesChange} />
    </label>
  </>
);
