import { useState, useEffect, useCallback, useRef } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';

const SAVE_DEBOUNCE_MS = 1000;
const CHANNEL_NAME = 'notepad-changes';
const POSTGRES_CHANGES_EVENT = 'postgres_changes';
const UPDATE_EVENT = 'UPDATE';
const NOTEPAD_TABLE = 'notepad';
const PUBLIC_SCHEMA = 'public';
const ONLINE_EVENT = 'online';
const DEFAULT_API_PATH = '/api/notepad';
const DEFAULT_STORAGE_KEY = 'notepad:content';

interface CachedNotepad {
  content: string;
  updatedAt: string | null;
  pendingSave: boolean;
}

export interface NotepadState {
  content: string;
  setContent: (content: string) => void;
  isSaving: boolean;
  isLoading: boolean;
  lastSaved: Date | null;
}

export interface UseNotepadOptions {
  supabase: SupabaseClient;
  authFetch: (
    input: RequestInfo | URL,
    init?: RequestInit,
  ) => Promise<Response>;
  apiPath?: string;
  storageKey?: string;
}

export const useNotepad = ({
  supabase,
  authFetch,
  apiPath = DEFAULT_API_PATH,
  storageKey = DEFAULT_STORAGE_KEY,
}: UseNotepadOptions): NotepadState => {
  const [content, setContentState] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialized = useRef(false);
  const isDirty = useRef(false);
  const updatedAt = useRef<string | null>(null);

  const readCache = useCallback((): CachedNotepad | null => {
    if (typeof window === 'undefined') return null;
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;
    return JSON.parse(raw) as CachedNotepad;
  }, [storageKey]);

  const writeCache = useCallback(
    (cache: CachedNotepad): void => {
      window.localStorage.setItem(storageKey, JSON.stringify(cache));
    },
    [storageKey],
  );

  const applyRemote = useCallback(
    (text: string, remoteUpdatedAt: string) => {
      if (isDirty.current) return;
      if (updatedAt.current && remoteUpdatedAt <= updatedAt.current) return;
      updatedAt.current = remoteUpdatedAt;
      setContentState(text);
      writeCache({
        content: text,
        updatedAt: remoteUpdatedAt,
        pendingSave: false,
      });
    },
    [writeCache],
  );

  const saveContent = useCallback(
    (text: string) => {
      setIsSaving(true);
      writeCache({
        content: text,
        updatedAt: updatedAt.current,
        pendingSave: true,
      });

      authFetch(apiPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      })
        .then(res => (res.ok ? res.json() : Promise.reject(res)))
        .then(data => {
          updatedAt.current = data.updatedAt;
          isDirty.current = false;
          writeCache({
            content: text,
            updatedAt: data.updatedAt,
            pendingSave: false,
          });
          setLastSaved(new Date());
        })
        .catch(() => undefined)
        .finally(() => setIsSaving(false));
    },
    [authFetch, apiPath, writeCache],
  );

  useEffect(() => {
    const cache = readCache();
    if (cache) {
      setContentState(cache.content);
      updatedAt.current = cache.updatedAt;
      if (cache.pendingSave) isDirty.current = true;
    }

    authFetch(apiPath)
      .then(res => res.json())
      .then(data => {
        if (data?.updatedAt) applyRemote(data.content ?? '', data.updatedAt);
        if (isDirty.current && cache) saveContent(cache.content);
      })
      .catch(() => undefined)
      .finally(() => {
        isInitialized.current = true;
        setIsLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel(CHANNEL_NAME)
      .on(
        POSTGRES_CHANGES_EVENT,
        { event: UPDATE_EVENT, schema: PUBLIC_SCHEMA, table: NOTEPAD_TABLE },
        payload => {
          const row = payload.new as { content: string; updated_at: string };
          applyRemote(row.content ?? '', row.updated_at);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, applyRemote]);

  useEffect(() => {
    const onReconnect = () => {
      const cache = readCache();
      if (cache?.pendingSave) saveContent(cache.content);
    };
    window.addEventListener(ONLINE_EVENT, onReconnect);
    return () => window.removeEventListener(ONLINE_EVENT, onReconnect);
  }, [readCache, saveContent]);

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
