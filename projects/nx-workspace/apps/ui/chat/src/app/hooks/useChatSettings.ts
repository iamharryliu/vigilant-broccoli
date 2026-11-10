'use client';

import { useEffect, useState } from 'react';
import type { LLMModel } from '@vigilant-broccoli/common-js';
import { CHAT_MODELS, DEFAULT_CHAT_MODEL, STORAGE_KEY } from '../app.const';

export const useChatSettings = () => {
  const [selectedModel, setSelectedModel] =
    useState<LLMModel>(DEFAULT_CHAT_MODEL);
  const [useKnowledgeBase, setUseKnowledgeBase] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY.MODEL) as LLMModel | null;
      if (stored && CHAT_MODELS.includes(stored)) setSelectedModel(stored);
      setUseKnowledgeBase(
        localStorage.getItem(STORAGE_KEY.USE_KNOWLEDGE_BASE) !== 'false',
      );
    } catch {
      // Storage unavailable; keep the defaults.
    }
  }, []);

  const changeModel = (model: LLMModel) => {
    setSelectedModel(model);
    try {
      localStorage.setItem(STORAGE_KEY.MODEL, model);
    } catch {
      // Preference just won't persist.
    }
  };

  const changeUseKnowledgeBase = (value: boolean) => {
    setUseKnowledgeBase(value);
    try {
      localStorage.setItem(STORAGE_KEY.USE_KNOWLEDGE_BASE, String(value));
    } catch {
      // Preference just won't persist.
    }
  };

  return {
    selectedModel,
    setSelectedModel: changeModel,
    useKnowledgeBase,
    setUseKnowledgeBase: changeUseKnowledgeBase,
  };
};
