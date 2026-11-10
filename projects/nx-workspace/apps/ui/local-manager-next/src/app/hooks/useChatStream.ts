'use client';

import { useCallback } from 'react';
import {
  HTTP_HEADERS,
  HTTP_METHOD,
  type LLMModel,
} from '@vigilant-broccoli/common-js';
import { getLocalTimeZone } from '@vigilant-broccoli/common-browser';
import {
  compactConversation,
  finalizeLastMessage,
  useChatStream as useBaseChatStream,
} from '@vigilant-broccoli/react-lib-higher-level';
import { authFetch } from '../../../libs/auth';
import { CHAT_API_PATH, CHAT_RESPONSE_TYPE } from '../constants/chatbot.consts';
import type { EventDraft } from '../components/event-draft-card.component';
import type {
  ChatSuggestion,
  Message,
  SetMessages,
} from '../components/chatbot/chatbot.types';
import { PLANNING_DATA_ERROR } from '../utils/day-analysis-data';
import { buildEventDraftMessages } from '../utils/chat-messages.utils';

const STREAMING_REPLY: Message = {
  role: 'assistant',
  content: '',
  isStreaming: true,
  isChatReply: true,
};

export const useChatStream = ({
  setMessages,
  systemPrompt,
  selectedModel,
  useKnowledgeBase,
  speak,
  stopSpeaking,
}: {
  setMessages: SetMessages;
  systemPrompt?: string;
  selectedModel: LLMModel;
  useKnowledgeBase: boolean;
  speak: (text: string) => Promise<void>;
  stopSpeaking: () => void;
}) => {
  // The calendar intent path answers with a JSON tool call instead of a stream.
  const handleToolCallResponse = useCallback(
    async (response: Response) => {
      const contentType = response.headers.get('Content-Type') ?? '';
      if (!contentType.includes('application/json')) return false;
      const payload = await response.json();
      if (payload.type !== CHAT_RESPONSE_TYPE.TOOL_CALL) return false;
      const events: EventDraft[] = payload.events;
      setMessages(prev => [
        ...prev
          .slice(0, -1)
          .filter(m => !m.eventDraft || m.eventStatus !== 'draft'),
        ...buildEventDraftMessages(events),
      ]);
      return true;
    },
    [setMessages],
  );

  const { isStreaming, runChat, stopStreaming, beginRun, sendRequest, endRun } =
    useBaseChatStream<Message>({
      setMessages,
      request: (history, signal) =>
        authFetch(CHAT_API_PATH, {
          method: HTTP_METHOD.POST,
          headers: { ...HTTP_HEADERS.CONTENT_TYPE.JSON },
          body: JSON.stringify({
            messages: history,
            systemPrompt,
            model: selectedModel,
            timeZone: getLocalTimeZone(),
            useKnowledgeBase,
          }),
          signal,
        }),
      onResponse: handleToolCallResponse,
      onReplyComplete: speak,
      onInterrupt: stopSpeaking,
    });

  const runSuggestion = async (
    messages: Message[],
    suggestion: ChatSuggestion,
  ) => {
    const controller = beginRun();
    const userMessage: Message = {
      role: 'user',
      content: suggestion.prompt || suggestion.title,
      displayContent: suggestion.title,
    };
    setMessages([...messages, userMessage, STREAMING_REPLY]);

    try {
      const result = await suggestion.onClick?.(controller.signal);
      if (controller.signal.aborted) return;
      const promptToUse = result?.prompt || suggestion.prompt;
      if (!promptToUse) {
        setMessages(messages);
        endRun();
        return;
      }
      const history = compactConversation([
        ...messages,
        { ...userMessage, content: promptToUse },
      ]);
      setMessages([...history, STREAMING_REPLY]);
      await sendRequest(history, controller.signal);
    } catch {
      if (controller.signal.aborted) return;
      finalizeLastMessage(setMessages, PLANNING_DATA_ERROR);
      endRun();
    }
  };

  return { isStreaming, runChat, runSuggestion, stopStreaming };
};
