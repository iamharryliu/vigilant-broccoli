import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CONTENT_TYPE_HEADER,
  HTTP_METHOD,
  HTTP_STATUS_CODES,
  JSON_CONTENT_TYPE,
} from '@vigilant-broccoli/common-js';
import { useWhiteboardRoom } from './whiteboard/useWhiteboardRoom';
import type { SupabaseBroadcastLike } from './whiteboard/supabase-broadcast.types';
import type { WhiteboardCursor } from './whiteboard/whiteboard-room.types';

const SAVE_DEBOUNCE_MS = 1000;
const BOOTSTRAP_WAIT_MS = 700;
const NOTEPAD_ROOM_CHANNEL = 'notepad-room';
const DEFAULT_API_PATH = '/api/notepad';
const DEFAULT_STORAGE_KEY = 'notepad:content';
const LOAD_ERROR_PREFIX = 'Failed to load notes: HTTP ';

interface CachedNotepad {
  content: string;
  updatedAt: string | null;
}

export interface NotepadState {
  content: string;
  setContent: (content: string) => void;
  isSaving: boolean;
  // Stays true until the server snapshot loads, including after a failed
  // load, so editors stay disabled and nothing is persisted over the row.
  isLoading: boolean;
  loadError: string | null;
  retryLoad: () => void;
  lastSaved: Date | null;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  cursors: WhiteboardCursor[];
  setCursorPosition: (x: number | null, y: number | null) => void;
  setTextCursorIndex: (index: number | null) => void;
}

export interface UseNotepadOptions {
  supabase: SupabaseBroadcastLike;
  authFetch: (
    input: RequestInfo | URL,
    init?: RequestInit,
  ) => Promise<Response>;
  userId: string;
  username?: string;
  channelName?: string;
  apiPath?: string;
  storageKey?: string;
  // Signed-in JWT. When set, the broadcast room is joined as a private,
  // RLS-authorized channel; the persisted content is already gated by the
  // /api/notepad table policy, and this closes the same gap on the live
  // sync channel. Omit only for a genuinely public notepad.
  accessToken?: string | null;
}

export const useNotepad = ({
  supabase,
  authFetch,
  userId,
  username = userId,
  channelName = NOTEPAD_ROOM_CHANNEL,
  apiPath = DEFAULT_API_PATH,
  storageKey = DEFAULT_STORAGE_KEY,
  accessToken,
}: UseNotepadOptions): NotepadState => {
  // The room keeps every currently-connected device's Y.Text merged live via
  // Supabase broadcast, so simultaneous edits from different devices combine
  // instead of one overwriting the other.
  const room = useWhiteboardRoom(
    supabase,
    channelName,
    userId,
    username,
    accessToken,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const roomContentRef = useRef(room.content);
  roomContentRef.current = room.content;
  const lastChangeIsEditRef = useRef(room.lastChangeIsEdit);
  lastChangeIsEditRef.current = room.lastChangeIsEdit;

  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const updatedAt = useRef<string | null>(null);
  // Text of the last successful save or loaded snapshot; only differing
  // content is persisted, so re-renders and token refreshes never re-save.
  const lastPersisted = useRef<string | null>(null);
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
      // Persisting only starts after a successful load, so any client may save
      // a board that this client or a peer cleared; a rebuilt, empty room
      // must never overwrite saved text. The server still 409s a stale base.
      const allowEmpty = !text && lastChangeIsEditRef.current;
      if (!text && !allowEmpty && lastPersisted.current) return;

      setIsSaving(true);
      const baseUpdatedAt = updatedAt.current;

      authFetch(apiPath, {
        method: HTTP_METHOD.POST,
        headers: { [CONTENT_TYPE_HEADER]: JSON_CONTENT_TYPE },
        body: JSON.stringify({ content: text, baseUpdatedAt, allowEmpty }),
      })
        .then(async res => {
          const data = await res.json();

          if (res.status === HTTP_STATUS_CODES.CONFLICT) {
            // Another device persisted since our last sync (or the server
            // refused an empty write) — adopt its snapshot into the live doc
            // without making it undoable.
            const latest = (data.content as string | undefined) ?? '';
            updatedAt.current = data.updatedAt;
            lastPersisted.current = latest;
            room.replaceContent(latest);
            return;
          }

          if (!res.ok) return Promise.reject(res);
          updatedAt.current = data.updatedAt;
          lastPersisted.current = text;
          writeCache({ content: text, updatedAt: data.updatedAt });
          setLastSaved(new Date());
        })
        .catch(() => undefined)
        .finally(() => setIsSaving(false));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [authFetch, apiPath, writeCache],
  );

  // One-time-per-notepad bootstrap: give any already-connected peer a moment
  // to answer with the live document over the broadcast room before we seed
  // it from the last durably-saved snapshot — seeding too early would insert
  // stale text alongside a peer's incoming state instead of joining it. Reruns
  // when apiPath/channelName change (e.g. switching boards) since that's a
  // different notepad, not just a re-render. A failed load never falls back
  // to an editable blank board: it stays unloaded until retryLoad succeeds.
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    hasBootstrapped.current = false;
    updatedAt.current = null;
    lastPersisted.current = null;
    setIsLoading(true);
    setLoadError(null);

    authFetch(apiPath)
      .then(res =>
        res.ok
          ? res.json()
          : Promise.reject(new Error(`${LOAD_ERROR_PREFIX}${res.status}`)),
      )
      .then(data => {
        if (cancelled) return;
        const seed: CachedNotepad = {
          content: (data?.content as string) ?? '',
          updatedAt: (data?.updatedAt as string | undefined) ?? null,
        };
        updatedAt.current = seed.updatedAt;

        setTimeout(() => {
          if (cancelled || hasBootstrapped.current) return;
          hasBootstrapped.current = true;
          lastPersisted.current = seed.content;

          if (!roomContentRef.current && seed.content) {
            room.replaceContent(seed.content);
          } else if (roomContentRef.current !== seed.content) {
            // A peer answered with content newer than our last known save —
            // persist it promptly instead of waiting for the next local edit.
            persist(roomContentRef.current);
          }
          setIsLoading(false);
        }, BOOTSTRAP_WAIT_MS);
      })
      .catch((error: Error) => {
        if (!cancelled) setLoadError(error.message);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, apiPath, channelName, loadAttempt]);

  const retryLoad = useCallback(() => setLoadAttempt(prev => prev + 1), []);

  // persist is a dependency so a token refresh retries a failed save, but the
  // lastPersisted check keeps it from re-saving unchanged (or empty) text.
  useEffect(() => {
    if (!hasBootstrapped.current) return;
    if (room.content === lastPersisted.current) return;
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(
      () => persist(room.content),
      SAVE_DEBOUNCE_MS,
    );
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, [room.content, persist]);

  // After a failed load the editor stays read-only; show this browser's last
  // saved copy rather than a blank board when no peer has sent the doc.
  const content =
    loadError && !room.content ? (readCache()?.content ?? '') : room.content;

  return {
    content,
    setContent: room.setContent,
    isSaving,
    isLoading,
    loadError,
    retryLoad,
    lastSaved,
    undo: room.undo,
    redo: room.redo,
    canUndo: room.canUndo,
    canRedo: room.canRedo,
    cursors: room.cursors,
    setCursorPosition: room.setCursorPosition,
    setTextCursorIndex: room.setTextCursorIndex,
  };
};
