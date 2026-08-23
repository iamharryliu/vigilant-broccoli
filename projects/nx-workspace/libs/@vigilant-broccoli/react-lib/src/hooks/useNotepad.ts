import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CONTENT_TYPE_HEADER,
  HTTP_METHOD,
  HTTP_STATUS_CODES,
  JSON_CONTENT_TYPE,
} from '@vigilant-broccoli/common-js';
import { useWhiteboardRoom } from '../whiteboard/useWhiteboardRoom';
import type { SupabaseBroadcastLike } from '../whiteboard/supabase-broadcast.types';

const SAVE_DEBOUNCE_MS = 1000;
const BOOTSTRAP_WAIT_MS = 700;
const NOTEPAD_ROOM_CHANNEL = 'notepad-room';
const DEFAULT_API_PATH = '/api/notepad';
const DEFAULT_STORAGE_KEY = 'notepad:content';

interface CachedNotepad {
  content: string;
  updatedAt: string | null;
}

export interface NotepadState {
  content: string;
  setContent: (content: string) => void;
  isSaving: boolean;
  isLoading: boolean;
  lastSaved: Date | null;
}

export interface UseNotepadOptions {
  supabase: SupabaseBroadcastLike;
  authFetch: (
    input: RequestInfo | URL,
    init?: RequestInit,
  ) => Promise<Response>;
  userId: string;
  apiPath?: string;
  storageKey?: string;
}

export const useNotepad = ({
  supabase,
  authFetch,
  userId,
  apiPath = DEFAULT_API_PATH,
  storageKey = DEFAULT_STORAGE_KEY,
}: UseNotepadOptions): NotepadState => {
  // The room keeps every currently-connected device's Y.Text merged live via
  // Supabase broadcast, so simultaneous edits from different devices combine
  // instead of one overwriting the other.
  const room = useWhiteboardRoom(supabase, NOTEPAD_ROOM_CHANNEL, userId, userId);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const roomContentRef = useRef(room.content);
  roomContentRef.current = room.content;

  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const updatedAt = useRef<string | null>(null);
  const hasBootstrapped = useRef(false);

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

  const persist = useCallback(
    (text: string) => {
      setIsSaving(true);
      const baseUpdatedAt = updatedAt.current;

      authFetch(apiPath, {
        method: HTTP_METHOD.POST,
        headers: { [CONTENT_TYPE_HEADER]: JSON_CONTENT_TYPE },
        body: JSON.stringify({ content: text, baseUpdatedAt }),
      })
        .then(async res => {
          const data = await res.json();

          if (res.status === HTTP_STATUS_CODES.CONFLICT) {
            // Another device persisted since our last sync — merge its
            // snapshot into the live doc instead of discarding it; the
            // resulting change re-triggers a save with the merged text.
            updatedAt.current = data.updatedAt;
            room.setContent(data.content ?? '');
            return;
          }

          if (!res.ok) return Promise.reject(res);
          updatedAt.current = data.updatedAt;
          writeCache({ content: text, updatedAt: data.updatedAt });
          setLastSaved(new Date());
        })
        .catch(() => undefined)
        .finally(() => setIsSaving(false));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [authFetch, apiPath, writeCache],
  );

  // One-time bootstrap: give any already-connected peer a moment to answer
  // with the live document over the broadcast room before we seed it from
  // the last durably-saved snapshot — seeding too early would insert stale
  // text alongside a peer's incoming state instead of joining it.
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    authFetch(apiPath)
      .then(res => (res.ok ? res.json() : Promise.reject(res)))
      .then(data => ({
        content: (data?.content as string) ?? '',
        updatedAt: (data?.updatedAt as string | undefined) ?? null,
      }))
      .catch(() => readCache() ?? { content: '', updatedAt: null })
      .then(seed => {
        if (cancelled) return;
        updatedAt.current = seed.updatedAt;

        setTimeout(() => {
          if (cancelled || hasBootstrapped.current) return;
          hasBootstrapped.current = true;

          if (!roomContentRef.current && seed.content) {
            room.setContent(seed.content);
          } else if (roomContentRef.current !== seed.content) {
            // A peer answered with content newer than our last known save —
            // persist it promptly instead of waiting for the next local edit.
            persist(roomContentRef.current);
          }
          setIsLoading(false);
        }, BOOTSTRAP_WAIT_MS);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    if (!hasBootstrapped.current) return;
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(
      () => persist(room.content),
      SAVE_DEBOUNCE_MS,
    );
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, [room.content, persist]);

  return {
    content: room.content,
    setContent: room.setContent,
    isSaving,
    isLoading,
    lastSaved,
  };
};
