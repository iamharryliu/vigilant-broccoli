import { MAX_MESSAGES } from './chatbot.consts';
import type { ChatbotMessage, SetChatbotMessages } from './chatbot.types';

export const compactConversation = <M extends ChatbotMessage>(
  messages: M[],
): M[] => {
  if (messages.length <= MAX_MESSAGES) return messages;

  const summary = {
    role: 'assistant',
    content: `[Previous conversation summarized: ${Math.floor(
      messages.length / 2,
    )} exchanges]`,
  } as M;

  return [summary, ...messages.slice(-MAX_MESSAGES + 1)];
};

// Updates return new message objects: mutating the previous state's objects
// in place breaks memoized rows and double-applies under StrictMode.
export const patchMessageAt = <M extends ChatbotMessage>(
  setMessages: SetChatbotMessages<M>,
  index: number,
  patch: Partial<M>,
) =>
  setMessages(prev =>
    prev.map((message, i) =>
      i === index ? { ...message, ...patch } : message,
    ),
  );

export const patchLastMessage = <M extends ChatbotMessage>(
  setMessages: SetChatbotMessages<M>,
  patch: Partial<M>,
) =>
  setMessages(prev =>
    prev.length === 0
      ? prev
      : prev.map((message, i) =>
          i === prev.length - 1 ? { ...message, ...patch } : message,
        ),
  );

export const finalizeLastMessage = <M extends ChatbotMessage>(
  setMessages: SetChatbotMessages<M>,
  content: string,
) =>
  patchLastMessage(setMessages, { content, isStreaming: false } as Partial<M>);
