'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  HTTP_HEADERS,
  HTTP_METHOD,
  type LLMModel,
} from '@vigilant-broccoli/common-js';
import { getLocalTimeZone } from '@vigilant-broccoli/common-browser';
import {
  API_ROUTE,
  CHAT_ERROR_MESSAGE,
  MAX_MESSAGES,
  STREAM_UPDATE_INTERVAL_MS,
} from '../app.const';
import type { Message, SetMessages } from '../chat.types';

const isAbortError = (err: unknown): boolean =>
  err instanceof DOMException && err.name === 'AbortError';

const STREAMING_REPLY: Message = {
  role: 'assistant',
  content: '',
  isStreaming: true,
  isChatReply: true,
};

const compactConversation = (messages: Message[]): Message[] => {
  if (messages.length <= MAX_MESSAGES) return messages;
  const summary: Message = {
    role: 'assistant',
    content: `[Previous conversation summarized: ${Math.floor(
      messages.length / 2,
    )} exchanges]`,
  };
  return [summary, ...messages.slice(-MAX_MESSAGES + 1)];
};

// Updates return new message objects: mutating the previous state's objects
// in place breaks memoized rows and double-applies under StrictMode.
const patchLastMessage = (setMessages: SetMessages, patch: Partial<Message>) =>
  setMessages(prev =>
    prev.length === 0
      ? prev
      : prev.map((message, i) =>
          i === prev.length - 1 ? { ...message, ...patch } : message,
        ),
  );

export const useChatStream = ({
  setMessages,
  selectedModel,
  useKnowledgeBase,
}: {
  setMessages: SetMessages;
  selectedModel: LLMModel;
  useKnowledgeBase: boolean;
}) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortControllerRef.current?.abort(), []);

  const processStreamResponse = async (
    responseBody: ReadableStream<Uint8Array>,
  ) => {
    const reader = responseBody.getReader();
    const decoder = new TextDecoder();
    let accumulatedContent = '';
    let lastUpdate = Date.now();

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
    }

    patchLastMessage(setMessages, {
      content: accumulatedContent,
      isStreaming: false,
    });
    setIsStreaming(false);
  };

  const failStream = () => {
    patchLastMessage(setMessages, {
      content: CHAT_ERROR_MESSAGE,
      isStreaming: false,
    });
    setIsStreaming(false);
  };

  // `base` ends with the user message to answer; the reply streams in after it.
  const runChat = async (base: Message[]) => {
    setIsStreaming(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const history = compactConversation(base);
    setMessages([...history, STREAMING_REPLY]);

    try {
      const response = await fetch(API_ROUTE.CHAT, {
        method: HTTP_METHOD.POST,
        headers: { ...HTTP_HEADERS.CONTENT_TYPE.JSON },
        body: JSON.stringify({
          messages: history,
          model: selectedModel,
          timeZone: getLocalTimeZone(),
          useKnowledgeBase,
        }),
        signal: controller.signal,
      });
      if (!response.ok || !response.body) {
        failStream();
        return;
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

  const stopStreaming = useCallback(() => {
    abortControllerRef.current?.abort();
    setMessages(prev => {
      const last = prev[prev.length - 1];
      if (last?.role !== 'assistant' || !last.isStreaming) return prev;
      return [...prev.slice(0, -1), { ...last, isStreaming: false }];
    });
    setIsStreaming(false);
  }, [setMessages]);

  return { isStreaming, runChat, stopStreaming };
};
