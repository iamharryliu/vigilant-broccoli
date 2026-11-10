'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  HTTP_HEADERS,
  HTTP_METHOD,
  type LLMModel,
} from '@vigilant-broccoli/common-js';
import { getLocalTimeZone } from '@vigilant-broccoli/common-browser';
import { authFetch } from '../../../libs/auth';
import {
  CHAT_API_PATH,
  CHAT_ERROR_MESSAGE,
  CHAT_RESPONSE_TYPE,
  STREAM_UPDATE_INTERVAL_MS,
} from '../constants/chatbot.consts';
import type { EventDraft } from '../components/event-draft-card.component';
import type {
  ChatSuggestion,
  Message,
  SetMessages,
} from '../components/chatbot/chatbot.types';
import { PLANNING_DATA_ERROR } from '../utils/day-analysis-data';
import {
  buildEventDraftMessages,
  compactConversation,
  finalizeLastMessage,
  patchLastMessage,
} from '../utils/chat-messages.utils';

const isAbortError = (err: unknown): boolean =>
  err instanceof DOMException && err.name === 'AbortError';

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
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(
    () => () => {
      abortControllerRef.current?.abort();
      stopSpeaking();
    },
    [stopSpeaking],
  );

  const processStreamResponse = async (
    responseBody: ReadableStream<Uint8Array>,
  ) => {
    const reader = responseBody.getReader();
    const decoder = new TextDecoder();
    let accumulatedContent = '';
    let lastUpdate = Date.now();
    let aborted = false;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        accumulatedContent += decoder.decode(value, { stream: true });

        const now = Date.now();
        if (now - lastUpdate > STREAM_UPDATE_INTERVAL_MS) {
          patchLastMessage(setMessages, { content: accumulatedContent });
          lastUpdate = now;
        }
      }
    } catch (err) {
      if (!isAbortError(err)) throw err;
      aborted = true;
    }

    finalizeLastMessage(setMessages, accumulatedContent);
    setIsStreaming(false);
    if (!aborted) await speak(accumulatedContent);
  };

  const handleToolCallResponse = (events: EventDraft[]) => {
    setMessages(prev => [
      ...prev
        .slice(0, -1)
        .filter(m => !m.eventDraft || m.eventStatus !== 'draft'),
      ...buildEventDraftMessages(events),
    ]);
    setIsStreaming(false);
  };

  const failStream = () => {
    patchLastMessage(setMessages, {
      content: CHAT_ERROR_MESSAGE,
      isStreaming: false,
    });
    setIsStreaming(false);
  };

  const sendChatRequest = async (history: Message[]) => {
    try {
      const response = await authFetch(CHAT_API_PATH, {
        method: HTTP_METHOD.POST,
        headers: { ...HTTP_HEADERS.CONTENT_TYPE.JSON },
        body: JSON.stringify({
          messages: history,
          systemPrompt,
          model: selectedModel,
          timeZone: getLocalTimeZone(),
          useKnowledgeBase,
        }),
        signal: abortControllerRef.current?.signal,
      });

      if (!response.ok || !response.body) {
        failStream();
        return;
      }

      const contentType = response.headers.get('Content-Type') ?? '';
      if (contentType.includes('application/json')) {
        const payload = await response.json();
        if (payload.type === CHAT_RESPONSE_TYPE.TOOL_CALL) {
          handleToolCallResponse(payload.events);
          return;
        }
      }

      await processStreamResponse(response.body);
    } catch (err) {
      if (isAbortError(err)) {
        setIsStreaming(false);
        return;
      }
      failStream();
    }
  };

  // `base` ends with the user message to answer; the reply streams in after it.
  const runChat = async (base: Message[]) => {
    setIsStreaming(true);
    stopSpeaking();
    abortControllerRef.current = new AbortController();

    const history = compactConversation(base);
    setMessages([...history, STREAMING_REPLY]);
    await sendChatRequest(history);
  };

  const runSuggestion = async (
    messages: Message[],
    suggestion: ChatSuggestion,
  ) => {
    setIsStreaming(true);
    stopSpeaking();
    const controller = new AbortController();
    abortControllerRef.current = controller;
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
        setIsStreaming(false);
        return;
      }
      const history = compactConversation([
        ...messages,
        { ...userMessage, content: promptToUse },
      ]);
      setMessages([...history, STREAMING_REPLY]);
      await sendChatRequest(history);
    } catch {
      if (controller.signal.aborted) return;
      finalizeLastMessage(setMessages, PLANNING_DATA_ERROR);
      setIsStreaming(false);
    }
  };

  const stopStreaming = useCallback(() => {
    abortControllerRef.current?.abort();
    stopSpeaking();
    setMessages(prev => {
      const last = prev[prev.length - 1];
      if (last?.role !== 'assistant' || !last.isStreaming) return prev;
      return [...prev.slice(0, -1), { ...last, isStreaming: false }];
    });
    setIsStreaming(false);
  }, [setMessages, stopSpeaking]);

  return { isStreaming, runChat, runSuggestion, stopStreaming };
};
