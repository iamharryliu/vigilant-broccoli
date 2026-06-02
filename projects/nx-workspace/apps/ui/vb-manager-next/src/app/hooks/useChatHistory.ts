'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Message } from '../components/chatbot-dialog.component';

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
  createdAt: number;
}

const STORAGE_KEY_CHATS = 'vb-manager-chats';
const STORAGE_KEY_CURRENT = 'vb-manager-chat-current';
const MAX_CHATS = 50;
const MAX_TITLE_LENGTH = 60;
const NEW_CHAT_TITLE = 'New chat';
const SAVE_DEBOUNCE_MS = 400;

const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const stripDisplayContent = (msg: Message): string =>
  (msg.displayContent || msg.content || '').trim();

const deriveTitle = (messages: Message[]): string => {
  const firstUser = messages.find(m => m.role === 'user');
  if (!firstUser) return NEW_CHAT_TITLE;
  const text = stripDisplayContent(firstUser);
  if (!text) return NEW_CHAT_TITLE;
  return text.length > MAX_TITLE_LENGTH
    ? `${text.slice(0, MAX_TITLE_LENGTH)}...`
    : text;
};

const loadChats = (): Chat[] => {
  try {
    const parsed = JSON.parse(
      localStorage.getItem(STORAGE_KEY_CHATS) ?? '[]',
    ) as Chat[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const loadCurrentId = (): string | null =>
  localStorage.getItem(STORAGE_KEY_CURRENT);

const saveChats = (chats: Chat[]) =>
  localStorage.setItem(STORAGE_KEY_CHATS, JSON.stringify(chats));

const saveCurrentId = (id: string | null) =>
  id
    ? localStorage.setItem(STORAGE_KEY_CURRENT, id)
    : localStorage.removeItem(STORAGE_KEY_CURRENT);

const sortByUpdated = (chats: Chat[]): Chat[] =>
  [...chats].sort((a, b) => b.updatedAt - a.updatedAt);

const countUserMessages = (messages: Message[]): number =>
  messages.reduce((count, m) => (m.role === 'user' ? count + 1 : count), 0);

export interface UseChatHistoryResult {
  chats: Chat[];
  currentChatId: string | null;
  currentMessages: Message[];
  sessionKey: string;
  selectChat: (id: string) => void;
  newChat: () => void;
  deleteChat: (id: string) => void;
  updateCurrentMessages: (messages: Message[]) => void;
  isHydrated: boolean;
}

export function useChatHistory(): UseChatHistoryResult {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [sessionKey, setSessionKey] = useState<string>(() => generateId());
  const [isHydrated, setIsHydrated] = useState(false);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const loaded = sortByUpdated(loadChats());
    setChats(loaded);
    const savedCurrent = loadCurrentId();
    const initialCurrent =
      savedCurrent && loaded.some(c => c.id === savedCurrent)
        ? savedCurrent
        : (loaded[0]?.id ?? null);
    setActiveChatId(initialCurrent);
    if (initialCurrent) setSessionKey(initialCurrent);
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    saveCurrentId(activeChatId);
  }, [activeChatId, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => saveChats(chats), SAVE_DEBOUNCE_MS);
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, [chats, isHydrated]);

  const selectChat = useCallback((id: string) => {
    setActiveChatId(id);
    setSessionKey(id);
  }, []);

  const newChat = useCallback(() => {
    setActiveChatId(null);
    setSessionKey(generateId());
  }, []);

  const deleteChat = useCallback(
    (id: string) => {
      setChats(prev => prev.filter(c => c.id !== id));
      if (activeChatId === id) {
        setActiveChatId(null);
        setSessionKey(generateId());
      }
    },
    [activeChatId],
  );

  const updateCurrentMessages = useCallback(
    (messages: Message[]) => {
      if (!isHydrated) return;

      if (messages.length === 0) {
        if (activeChatId === null) return;
        setChats(prev => prev.filter(c => c.id !== activeChatId));
        setActiveChatId(null);
        return;
      }

      if (activeChatId === null) {
        const id = generateId();
        const now = Date.now();
        const chat: Chat = {
          id,
          title: deriveTitle(messages),
          messages,
          updatedAt: now,
          createdAt: now,
        };
        setChats(prev => [chat, ...prev].slice(0, MAX_CHATS));
        setActiveChatId(id);
        return;
      }

      setChats(prev => {
        const existing = prev.find(c => c.id === activeChatId);
        const now = Date.now();
        if (!existing) {
          const chat: Chat = {
            id: activeChatId,
            title: deriveTitle(messages),
            messages,
            updatedAt: now,
            createdAt: now,
          };
          return [chat, ...prev].slice(0, MAX_CHATS);
        }
        const userCountChanged =
          countUserMessages(messages) !== countUserMessages(existing.messages);
        const next = prev.map(c =>
          c.id === activeChatId
            ? {
                ...c,
                messages,
                updatedAt: userCountChanged ? now : c.updatedAt,
                title:
                  c.title && c.title !== NEW_CHAT_TITLE
                    ? c.title
                    : deriveTitle(messages),
              }
            : c,
        );
        return userCountChanged ? sortByUpdated(next) : next;
      });
    },
    [activeChatId, isHydrated],
  );

  const currentChat = activeChatId
    ? chats.find(c => c.id === activeChatId)
    : null;
  const currentMessages = currentChat ? currentChat.messages : [];

  return {
    chats,
    currentChatId: activeChatId,
    currentMessages,
    sessionKey,
    selectChat,
    newChat,
    deleteChat,
    updateCurrentMessages,
    isHydrated,
  };
}
