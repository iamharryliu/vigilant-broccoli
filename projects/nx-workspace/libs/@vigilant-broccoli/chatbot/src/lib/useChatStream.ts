'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CHAT_ERROR_MESSAGE,
  STREAM_UPDATE_INTERVAL_MS,
} from './chatbot.consts';
import type { ChatbotMessage, SetChatbotMessages } from './chatbot.types';
import {
  compactConversation,
  patchLastMessage,
} from './chatbot-messages.utils';

const isAbortError = (err: unknown): boolean =>
  err instanceof DOMException && err.name === 'AbortError';

interface UseChatStreamOptions<M extends ChatbotMessage> {
  setMessages: SetChatbotMessages<M>;
  // Issues the request for `history`; the body must stream plain text.
  request: (history: M[], signal: AbortSignal) => Promise<Response>;
  // Lets the caller consume a non-stream response (e.g. a JSON tool call).
  // Return true when it was handled.
  onResponse?: (response: Response) => boolean | Promise<boolean>;
  // Runs when a stream finishes without being stopped.
  onReplyComplete?: (content: string) => void | Promise<void>;
  // Runs when a run starts or is stopped, e.g. to silence speech output.
  onInterrupt?: () => void;
}

const STREAMING_REPLY = {
  role: 'assistant',
  content: '',
  isStreaming: true,
  isChatReply: true,
} as const;

export const useChatStream = <M extends ChatbotMessage>({
  setMessages,
  request,
  onResponse,
  onReplyComplete,
  onInterrupt,
}: UseChatStreamOptions<M>) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const onInterruptRef = useRef(onInterrupt);
  useEffect(() => {
    onInterruptRef.current = onInterrupt;
  }, [onInterrupt]);

  useEffect(
    () => () => {
      abortControllerRef.current?.abort();
      onInterruptRef.current?.();
    },
    [],
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
          patchLastMessage(setMessages, {
            content: accumulatedContent,
          } as Partial<M>);
          lastUpdate = now;
        }
      }
    } catch (err) {
      if (!isAbortError(err)) throw err;
      aborted = true;
    }

    patchLastMessage(setMessages, {
      content: accumulatedContent,
      isStreaming: false,
    } as Partial<M>);
    setIsStreaming(false);
    if (!aborted) await onReplyComplete?.(accumulatedContent);
  };

  const failStream = () => {
    patchLastMessage(setMessages, {
      content: CHAT_ERROR_MESSAGE,
      isStreaming: false,
    } as Partial<M>);
    setIsStreaming(false);
  };

  // Marks a run as started. Callers that prepare the request themselves pair
  // this with `sendRequest` and `endRun`.
  const beginRun = () => {
    setIsStreaming(true);
    onInterrupt?.();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    return controller;
  };

  const endRun = () => setIsStreaming(false);

  const sendRequest = async (history: M[], signal: AbortSignal) => {
    try {
      const response = await request(history, signal);
      if (!response.ok || !response.body) {
        failStream();
        return;
      }
      if (await onResponse?.(response)) {
        setIsStreaming(false);
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

  // `base` ends with the user message to answer; the reply streams in after it.
  const runChat = async (base: M[]) => {
    const controller = beginRun();
    const history = compactConversation(base);
    setMessages([...history, STREAMING_REPLY as unknown as M]);
    await sendRequest(history, controller.signal);
  };

  const stopStreaming = useCallback(() => {
    abortControllerRef.current?.abort();
    onInterruptRef.current?.();
    setMessages(prev => {
      const last = prev[prev.length - 1];
      if (last?.role !== 'assistant' || !last.isStreaming) return prev;
      return [...prev.slice(0, -1), { ...last, isStreaming: false }];
    });
    setIsStreaming(false);
  }, [setMessages]);

  return {
    isStreaming,
    runChat,
    stopStreaming,
    beginRun,
    sendRequest,
    endRun,
  };
};
