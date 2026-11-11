'use client';

import { useEffect, useState } from 'react';
import {
  DEFAULT_VOICE_ID,
  ELEVENLABS_FREE_VOICE_OPTIONS,
  type LLMModel,
} from '@vigilant-broccoli/common-js';

export interface ChatSettingsStorageKeys {
  model: string;
  useKnowledgeBase: string;
  speakReplies: string;
  voiceId: string;
}

const writeSetting = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Preference just won't persist.
  }
};

export const useChatSettings = ({
  models,
  defaultModel,
  storageKeys,
}: {
  models: readonly LLMModel[];
  defaultModel: LLMModel;
  storageKeys: ChatSettingsStorageKeys;
}) => {
  const [selectedModel, setSelectedModel] = useState<LLMModel>(defaultModel);
  const [useKnowledgeBase, setUseKnowledgeBase] = useState(true);
  const [speakReplies, setSpeakReplies] = useState(true);
  const [voiceId, setVoiceId] = useState<string>(DEFAULT_VOICE_ID);

  useEffect(() => {
    try {
      const storedModel = localStorage.getItem(
        storageKeys.model,
      ) as LLMModel | null;
      if (storedModel && models.includes(storedModel))
        setSelectedModel(storedModel);
      setUseKnowledgeBase(
        localStorage.getItem(storageKeys.useKnowledgeBase) !== 'false',
      );
      setSpeakReplies(
        localStorage.getItem(storageKeys.speakReplies) !== 'false',
      );
      const storedVoice = localStorage.getItem(storageKeys.voiceId);
      if (ELEVENLABS_FREE_VOICE_OPTIONS.some(v => v.value === storedVoice))
        setVoiceId(storedVoice as string);
    } catch {
      // Storage unavailable; keep the defaults.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- read once on mount
  }, []);

  return {
    selectedModel,
    setSelectedModel: (model: LLMModel) => {
      setSelectedModel(model);
      writeSetting(storageKeys.model, model);
    },
    useKnowledgeBase,
    setUseKnowledgeBase: (value: boolean) => {
      setUseKnowledgeBase(value);
      writeSetting(storageKeys.useKnowledgeBase, String(value));
    },
    speakReplies,
    setSpeakReplies: (value: boolean) => {
      setSpeakReplies(value);
      writeSetting(storageKeys.speakReplies, String(value));
    },
    voiceId,
    setVoiceId: (value: string) => {
      setVoiceId(value);
      writeSetting(storageKeys.voiceId, value);
    },
  };
};
