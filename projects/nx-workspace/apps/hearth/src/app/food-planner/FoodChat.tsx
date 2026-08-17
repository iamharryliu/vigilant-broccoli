'use client';

import { KeyboardEvent, useEffect, useRef, useState } from 'react';
import { ChatSendButton, Text, Textarea } from '@vigilant-broccoli/react-lib';
import { useAuth } from '../providers/auth-provider';
import { useHome } from '../providers/home-provider';

const CHAT_ENDPOINT = '/api/food-planner/chat';
const PLACEHOLDER = 'Ask about meals, or say what to buy or cook…';
const EMPTY_TEXT =
  'Chat about food. I can add ingredients to your grocery list and tasks to kitchen chores.';
const ERROR_REPLY = 'Something went wrong. Please try again.';
const GROCERY_LABEL = 'Added to grocery list';
const CHORES_LABEL = 'Added to kitchen chores';
const EVENTS_LABEL = 'Added to kitchen events';

type Role = 'user' | 'assistant';

type Added = {
  groceryItems: string[];
  kitchenChores: string[];
  events: string[];
};

type ChatMessage = {
  role: Role;
  content: string;
  added?: Added;
};

type Props = {
  onAdded?: () => void;
};

const hasAdded = (added?: Added): boolean =>
  !!added &&
  (added.groceryItems.length > 0 ||
    added.kitchenChores.length > 0 ||
    added.events.length > 0);

const postChat = async (
  token: string,
  homeId: string | number,
  history: ChatMessage[],
): Promise<ChatMessage> => {
  const res = await fetch(CHAT_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      homeId,
      messages: history.map(({ role, content }) => ({ role, content })),
    }),
  }).catch(() => null);

  if (!res || !res.ok) return { role: 'assistant', content: ERROR_REPLY };

  const data = await res.json();
  return {
    role: 'assistant',
    content: data.reply ?? ERROR_REPLY,
    added: {
      groceryItems: data.added?.groceryItems ?? [],
      kitchenChores: data.added?.kitchenChores ?? [],
      events: data.added?.events ?? [],
    },
  };
};

export function FoodChat({ onAdded }: Props) {
  const session = useAuth();
  const { selectedHomeId: homeId } = useHome();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const token = session?.access_token ?? '';

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, sending]);

  const send = async () => {
    const content = input.trim();
    if (!content || !homeId || !token || sending) return;

    const history: ChatMessage[] = [...messages, { role: 'user', content }];
    setMessages(history);
    setInput('');
    setSending(true);

    const reply = await postChat(token, homeId, history);
    setMessages(prev => [...prev, reply]);
    setSending(false);
    if (hasAdded(reply.added)) onAdded?.();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  if (!homeId) return null;

  const renderAdded = (added: Added) => (
    <div className="mt-2 flex flex-col gap-1">
      {added.groceryItems.length > 0 && (
        <Text size="1" color="green">
          {GROCERY_LABEL}: {added.groceryItems.join(', ')}
        </Text>
      )}
      {added.kitchenChores.length > 0 && (
        <Text size="1" color="green">
          {CHORES_LABEL}: {added.kitchenChores.join(', ')}
        </Text>
      )}
      {added.events.length > 0 && (
        <Text size="1" color="green">
          {EVENTS_LABEL}: {added.events.join(', ')}
        </Text>
      )}
    </div>
  );

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div
        ref={scrollRef}
        className="flex min-h-[12rem] flex-1 flex-col gap-3 overflow-y-auto"
      >
        {messages.length === 0 ? (
          <div className="flex flex-1 items-center justify-center py-6">
            <Text align="center" color="gray" size="2">
              {EMPTY_TEXT}
            </Text>
          </div>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 ${
                  m.role === 'user'
                    ? 'bg-[var(--accent-a4)]'
                    : 'bg-[var(--gray-a3)]'
                }`}
              >
                <Text size="2" className="whitespace-pre-wrap">
                  {m.content}
                </Text>
                {hasAdded(m.added) && renderAdded(m.added as Added)}
              </div>
            </div>
          ))
        )}
        {sending && (
          <div className="flex justify-start">
            <div className="rounded-lg bg-[var(--gray-a3)] px-3 py-2">
              <Text size="2" color="gray">
                Thinking…
              </Text>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-end gap-2">
        <Textarea
          className="min-h-[44px] grow"
          rows={2}
          placeholder={PLACEHOLDER}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={sending}
        />
        <ChatSendButton
          isStreaming={false}
          isDisabled={!input.trim() || sending}
          onSend={send}
          onStop={() => undefined}
        />
      </div>
    </div>
  );
}
