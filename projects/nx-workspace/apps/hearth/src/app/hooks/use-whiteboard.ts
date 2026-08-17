'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../../libs/supabase';

const SAVE_DEBOUNCE_MS = 1000;
const WHITEBOARD_API = '/api/whiteboard';
const STORAGE_KEY_PREFIX = 'whiteboard:content:';
const CHANNEL_NAME_PREFIX = 'whiteboard-changes-';
const POSTGRES_CHANGES_EVENT = 'postgres_changes';
const UPDATE_EVENT = '*';
const WHITEBOARDS_TABLE = 'whiteboards';
const PUBLIC_SCHEMA = 'public';
const ONLINE_EVENT = 'online';
const DEFAULT_BOARD_KEY = 'family';

interface CachedWhiteboard {
  content: string;
  updatedAt: string | null;
  pendingSave: boolean;
}

interface WhiteboardState {
  content: string;
  setContent: (content: string) => void;
  isSaving: boolean;
  isLoading: boolean;
  lastSaved: Date | null;
}

const storageKey = (homeId: number, boardKey: string) =>
  `${STORAGE_KEY_PREFIX}${homeId}:${boardKey}`;

const readCache = (
  homeId: number,
  boardKey: string,
): CachedWhiteboard | null => {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(storageKey(homeId, boardKey));
  if (!raw) return null;
  return JSON.parse(raw) as CachedWhiteboard;
};

const writeCache = (
  homeId: number,
  boardKey: string,
  cache: CachedWhiteboard,
): void => {
  window.localStorage.setItem(
    storageKey(homeId, boardKey),
    JSON.stringify(cache),
  );
};

export const useWhiteboard = (
  homeId: number | null,
  token: string,
  boardKey: string = DEFAULT_BOARD_KEY,
): WhiteboardState => {
  const [content, setContentState] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialized = useRef(false);
  const isDirty = useRef(false);
  const updatedAt = useRef<string | null>(null);

  const authHeader = useCallback(
    () => ({ Authorization: `Bearer ${token}` }),
    [token],
  );

  const applyRemote = useCallback(
    (text: string, remoteUpdatedAt: string) => {
      if (!homeId) return;
      if (isDirty.current) return;
      if (updatedAt.current && remoteUpdatedAt <= updatedAt.current) return;
      updatedAt.current = remoteUpdatedAt;
      setContentState(text);
      writeCache(homeId, boardKey, {
        content: text,
        updatedAt: remoteUpdatedAt,
        pendingSave: false,
      });
    },
    [homeId, boardKey],
  );

  const saveContent = useCallback(
    (text: string) => {
      if (!homeId) return;
      setIsSaving(true);
      writeCache(homeId, boardKey, {
        content: text,
        updatedAt: updatedAt.current,
        pendingSave: true,
      });

      fetch(WHITEBOARD_API, {
        method: 'PUT',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ homeId, content: text, boardKey }),
      })
        .then(res => (res.ok ? res.json() : Promise.reject(res)))
        .then(data => {
          updatedAt.current = data.updatedAt;
          isDirty.current = false;
          writeCache(homeId, boardKey, {
            content: text,
            updatedAt: data.updatedAt,
            pendingSave: false,
          });
          setLastSaved(new Date());
        })
        .catch(() => undefined)
        .finally(() => setIsSaving(false));
    },
    [homeId, boardKey, authHeader],
  );

  useEffect(() => {
    if (!homeId || !token) return;

    isInitialized.current = false;
    isDirty.current = false;
    updatedAt.current = null;
    setIsLoading(true);

    const cache = readCache(homeId, boardKey);
    if (cache) {
      setContentState(cache.content);
      updatedAt.current = cache.updatedAt;
      if (cache.pendingSave) isDirty.current = true;
    } else {
      setContentState('');
    }

    fetch(`${WHITEBOARD_API}?homeId=${homeId}&boardKey=${boardKey}`, {
      headers: authHeader(),
    })
      .then(res => res.json())
      .then(data => {
        if (data?.updatedAt) applyRemote(data.content ?? '', data.updatedAt);
        else if (!cache) setContentState('');
        if (isDirty.current && cache) saveContent(cache.content);
      })
      .catch(() => undefined)
      .finally(() => {
        isInitialized.current = true;
        setIsLoading(false);
      });
  }, [homeId, boardKey, token, authHeader, applyRemote, saveContent]);

  useEffect(() => {
    if (!homeId) return;
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;

    const channel = supabase
      .channel(`${CHANNEL_NAME_PREFIX}${homeId}-${boardKey}`)
      .on(
        POSTGRES_CHANGES_EVENT,
        {
          event: UPDATE_EVENT,
          schema: PUBLIC_SCHEMA,
          table: WHITEBOARDS_TABLE,
          filter: `home_id=eq.${homeId}`,
        },
        payload => {
          const row = payload.new as {
            content: string;
            updated_at: string;
            board_key: string;
          };
          if (row && row.board_key === boardKey)
            applyRemote(row.content ?? '', row.updated_at);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [homeId, boardKey, applyRemote]);

  useEffect(() => {
    if (!homeId) return;
    const onReconnect = () => {
      const cache = readCache(homeId, boardKey);
      if (cache?.pendingSave) saveContent(cache.content);
    };
    window.addEventListener(ONLINE_EVENT, onReconnect);
    return () => window.removeEventListener(ONLINE_EVENT, onReconnect);
  }, [homeId, boardKey, saveContent]);

  const setContent = useCallback(
    (text: string) => {
      setContentState(text);
      if (!isInitialized.current) return;

      isDirty.current = true;
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(
        () => saveContent(text),
        SAVE_DEBOUNCE_MS,
      );
    },
    [saveContent],
  );

  return { content, setContent, isSaving, isLoading, lastSaved };
};
