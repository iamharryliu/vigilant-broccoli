import { useEffect, useState } from 'react';
import type { LLMModel } from '@vigilant-broccoli/common-js';
import {
  DEFAULT_CHAT_MODEL,
  STORAGE_KEY_USE_KNOWLEDGE_BASE,
} from '../constants/chatbot.consts';

export const useChatSettings = () => {
  const [selectedModel, setSelectedModel] =
    useState<LLMModel>(DEFAULT_CHAT_MODEL);
  const [useKnowledgeBase, setUseKnowledgeBase] = useState(true);

  useEffect(() => {
    try {
      setUseKnowledgeBase(
        localStorage.getItem(STORAGE_KEY_USE_KNOWLEDGE_BASE) !== 'false',
      );
    } catch {
      // Storage unavailable; keep the knowledge base on.
    }
  }, []);

  const changeUseKnowledgeBase = (value: boolean) => {
    setUseKnowledgeBase(value);
    try {
      localStorage.setItem(STORAGE_KEY_USE_KNOWLEDGE_BASE, String(value));
    } catch {
      // Preference just won't persist.
    }
  };

  return {
    selectedModel,
    setSelectedModel,
    useKnowledgeBase,
    setUseKnowledgeBase: changeUseKnowledgeBase,
  };
};
