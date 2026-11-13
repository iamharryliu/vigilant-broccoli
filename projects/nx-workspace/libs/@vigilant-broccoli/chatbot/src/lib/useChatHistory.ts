'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { ChatbotMessage } from './chatbot.types';

export interface Chat<M extends ChatbotMessage = ChatbotMessage> {
  id: string;
  title: string;
  messages: M[];
  updatedAt: number;
  createdAt: number;
  pinned?: boolean;
}

export interface ChatHistoryStorageKeys {
  chats: string;
  currentChat: string;
}

const MAX_CHATS = 50;
const MAX_TITLE_LENGTH = 60;
const NEW_CHAT_TITLE = 'New chat';
const SAVE_DEBOUNCE_MS = 400;

const generateId = () => `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;

const deriveTitle = (messages: ChatbotMessage[]): string => {
  const firstUser = messages.find(m => m.role === 'user');
  if (!firstUser) return NEW_CHAT_TITLE;
  const text = (firstUser.displayContent || firstUser.content || '').trim();
  if (!text) return NEW_CHAT_TITLE;
  return text.length > MAX_TITLE_LENGTH
    ? `${text.slice(0, MAX_TITLE_LENGTH)}...`
    : text;
};

const sortByUpdated = <C extends Chat>(chats: C[]): C[] =>
  [...chats].sort((a, b) => b.updatedAt - a.updatedAt);

// Drops the oldest unpinned chats first so pinning protects against the cap.
const capChats = <C extends Chat>(chats: C[]): C[] => {
  let excess = chats.length - MAX_CHATS;
  if (excess <= 0) return chats;
  const dropped = new Set<string>();
  for (let i = chats.length - 1; i >= 0 && excess > 0; i--) {
    if (!chats[i].pinned) {
      dropped.add(chats[i].id);
      excess--;
    }
  }
  return chats.filter(c => !dropped.has(c.id));
};

const countUserMessages = (messages: ChatbotMessage[]): number =>
  messages.reduce((count, m) => (m.role === 'user' ? count + 1 : count), 0);

export interface UseChatHistoryResult<M extends ChatbotMessage> {
  chats: Chat<M>[];
  currentChatId: string | null;
  currentMessages: M[];
  sessionKey: string;
  selectChat: (id: string) => void;
  newChat: () => void;
  deleteChat: (id: string) => void;
  renameChat: (id: string, title: string) => void;
  togglePinChat: (id: string) => void;
  updateCurrentMessages: (messages: M[]) => void;
  isHydrated: boolean;
}

// Chats live in browser local storage under the caller's keys, so each app
// keeps its own history.
export function useChatHistory<M extends ChatbotMessage>(
  storageKeys: ChatHistoryStorageKeys,
): UseChatHistoryResult<M> {
  const [chats, setChats] = useState<Chat<M>[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [sessionKey, setSessionKey] = useState<string>(() => generateId());
  const [isHydrated, setIsHydrated] = useState(false);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingChats = useRef<Chat<M>[] | null>(null);
  const keysRef = useRef(storageKeys);

  useEffect(() => {
    const { chats: chatsKey, currentChat } = keysRef.current;
    let loaded: Chat<M>[] = [];
    try {
      const parsed = JSON.parse(
        localStorage.getItem(chatsKey) ?? '[]',
      ) as Chat<M>[];
      loaded = Array.isArray(parsed) ? sortByUpdated(parsed) : [];
    } catch {
      // Unreadable history starts empty.
    }
    setChats(loaded);
    const savedCurrent = localStorage.getItem(currentChat);
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
    const { currentChat } = keysRef.current;
    if (activeChatId) localStorage.setItem(currentChat, activeChatId);
    else localStorage.removeItem(currentChat);
  }, [activeChatId, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    const saveChats = () =>
      localStorage.setItem(keysRef.current.chats, JSON.stringify(chats));
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    pendingChats.current = chats;
    saveTimeout.current = setTimeout(saveChats, SAVE_DEBOUNCE_MS);
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, [chats, isHydrated]);

  useEffect(() => {
    return () => {
      if (pendingChats.current) {
        localStorage.setItem(
          keysRef.current.chats,
          JSON.stringify(pendingChats.current),
        );
      }
    };
  }, []);

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

  const renameChat = useCallback((id: string, title: string) => {
    const trimmed = title.trim().slice(0, MAX_TITLE_LENGTH);
    if (!trimmed) return;
    setChats(prev =>
      prev.map(c => (c.id === id ? { ...c, title: trimmed } : c)),
    );
  }, []);

  const togglePinChat = useCallback((id: string) => {
    setChats(prev =>
      prev.map(c => (c.id === id ? { ...c, pinned: !c.pinned } : c)),
    );
  }, []);

  const updateCurrentMessages = useCallback(
    (messages: M[]) => {
      if (!isHydrated) return;

      if (messages.length === 0) {
        if (activeChatId === null) return;
        setChats(prev => prev.filter(c => c.id !== activeChatId));
        setActiveChatId(null);
        return;
      }

      const createChat = (id: string): Chat<M> => {
        const now = Date.now();
        return {
          id,
          title: deriveTitle(messages),
          messages,
          updatedAt: now,
          createdAt: now,
        };
      };

      if (activeChatId === null) {
        const chat = createChat(generateId());
        setChats(prev => capChats([chat, ...prev]));
        setActiveChatId(chat.id);
        return;
      }

      setChats(prev => {
        const existing = prev.find(c => c.id === activeChatId);
        if (!existing) return capChats([createChat(activeChatId), ...prev]);
        const userCountChanged =
          countUserMessages(messages) !== countUserMessages(existing.messages);
        const now = Date.now();
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

  return {
    chats,
    currentChatId: activeChatId,
    currentMessages: currentChat ? currentChat.messages : [],
    sessionKey,
    selectChat,
    newChat,
    deleteChat,
    renameChat,
    togglePinChat,
    updateCurrentMessages,
    isHydrated,
  };
}
