import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CONTENT_TYPE_HEADER,
  HTTP_METHOD,
  HTTP_STATUS_CODES,
  JSON_CONTENT_TYPE,
} from '@vigilant-broccoli/common-js';
import {
  CONNECTION_STATUS,
  createTextSeedState,
  useWhiteboardRoom,
  type SupabaseBroadcastLike,
  type WhiteboardCursor,
} from '@vigilant-broccoli/realtime';
import type { NotepadDocument, NotepadSaveRequest } from './notepad.types';

const SAVE_DEBOUNCE_MS = 1000;
// Legacy rows only: time after SUBSCRIBED for an already-connected peer to
// answer the state request before this client seeds the doc from text.
const PEER_STATE_GRACE_MS = 700;
// Browsers reject keepalive requests whose in-flight bodies exceed 64 KiB.
const KEEPALIVE_BODY_LIMIT_BYTES = 60 * 1024;
const NOTEPAD_ROOM_CHANNEL = 'notepad-room';
const DEFAULT_API_PATH = '/api/notepad';
const DEFAULT_STORAGE_KEY = 'notepad:content';
const LOAD_ERROR_PREFIX = 'Failed to load notes: HTTP ';
const PAGEHIDE_EVENT = 'pagehide';

interface CachedNotepad {
  content: string;
  updatedAt: string | null;
}

interface LegacySeed {
  content: string;
  docGeneration: number;
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

const serializeSave = (body: NotepadSaveRequest, keepalive: boolean) => {
  const serialized = JSON.stringify(body);
  if (!keepalive || new Blob([serialized]).size <= KEEPALIVE_BODY_LIMIT_BYTES)
    return serialized;
  // Keeping the closing edit beats keeping its Yjs state: the server clears
  // the state and the next load seeds the doc from this text.
  return JSON.stringify({ ...body, yjsState: null });
};

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
  // Supabase broadcast, and the persisted Yjs state gives every device the
  // same document history, so loads, peer replies and conflict merges join
  // the same items instead of inserting the text again.
  const room = useWhiteboardRoom(
    supabase,
    channelName,
    userId,
    username,
    accessToken,
  );
  const {
    applyState,
    encodeState,
    getContent,
    replaceContent,
    docGeneration,
    connectionStatus,
  } = room;
  const [pendingSaves, setPendingSaves] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [legacySeed, setLegacySeed] = useState<LegacySeed | null>(null);

  const lastChangeIsEditRef = useRef(room.lastChangeIsEdit);
  lastChangeIsEditRef.current = room.lastChangeIsEdit;
  const docGenerationRef = useRef(docGeneration);
  docGenerationRef.current = docGeneration;
  // The load is keyed by notepad and doc generation only; a token refresh
  // changes authFetch but must not reload (and reset) a loaded notepad.
  const authFetchRef = useRef(authFetch);
  authFetchRef.current = authFetch;

  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const updatedAt = useRef<string | null>(null);
  // Text of the last successful save or loaded snapshot; only differing
  // content is persisted, so re-renders and token refreshes never re-save.
  const lastPersisted = useRef<string | null>(null);
  // Doc generation whose load finished; saves are off until it matches the
  // current one, so a rebuilt, still-empty doc is never persisted.
  const loadedGeneration = useRef(0);

  const readCache = useCallback((): CachedNotepad | null => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = window.localStorage.getItem(storageKey);
      return raw ? (JSON.parse(raw) as CachedNotepad) : null;
    } catch {
      return null;
    }
  }, [storageKey]);

  const writeCache = useCallback(
    (cache: CachedNotepad): void => {
      window.localStorage.setItem(storageKey, JSON.stringify(cache));
    },
    [storageKey],
  );

  const persist = useCallback(
    function save(keepalive = false) {
      const text = getContent();
      // Persisting only starts after a successful load, so any client may save
      // a board that this client or a peer cleared; a rebuilt, empty room
      // must never overwrite saved text. The server still 409s a stale base.
      const allowEmpty = !text && lastChangeIsEditRef.current;
      if (!text && !allowEmpty && lastPersisted.current) return;

      const generation = docGenerationRef.current;
      const body: NotepadSaveRequest = {
        content: text,
        yjsState: encodeState(),
        baseUpdatedAt: updatedAt.current,
        allowEmpty,
      };
      setPendingSaves(count => count + 1);

      authFetch(apiPath, {
        method: HTTP_METHOD.POST,
        headers: { [CONTENT_TYPE_HEADER]: JSON_CONTENT_TYPE },
        body: serializeSave(body, keepalive),
        keepalive,
      })
        .then(async res => {
          const data = (await res.json()) as NotepadDocument;
          if (generation !== docGenerationRef.current) return;

          if (res.status === HTTP_STATUS_CODES.CONFLICT) {
            // Another device persisted since our last sync (or the server
            // refused an empty write).
            updatedAt.current = data.updatedAt;
            lastPersisted.current = data.content;
            if (!data.yjsState) {
              // Written by a client without Yjs state: only its text can be
              // adopted, as a non-undoable snapshot.
              replaceContent(data.content);
              return;
            }
            // Merging keeps both sides' edits. Whatever the merge holds beyond
            // the saved row is re-saved on top of the row just merged.
            applyState(data.yjsState);
            if (getContent() !== data.content) save();
            return;
          }

          if (!res.ok) return Promise.reject(res);
          updatedAt.current = data.updatedAt;
          lastPersisted.current = text;
          writeCache({ content: text, updatedAt: data.updatedAt });
          setLastSaved(new Date());
        })
        .catch(() => undefined)
        .finally(() => setPendingSaves(count => count - 1));
    },
    [
      authFetch,
      apiPath,
      writeCache,
      applyState,
      encodeState,
      getContent,
      replaceContent,
    ],
  );
  const persistRef = useRef(persist);
  persistRef.current = persist;

  const completeLoad = useCallback(
    (savedContent: string) => {
      lastPersisted.current = savedContent;
      loadedGeneration.current = docGenerationRef.current;
      setIsLoading(false);
      // A peer's live state can hold edits the saved row lacks; persist them
      // now instead of waiting for the next local edit.
      if (getContent() !== savedContent) persistRef.current();
    },
    [getContent],
  );

  // Loads the notepad into each new doc generation (first mount, a switched
  // board, or a room rebuilt when the token first arrives). Applying the
  // persisted state is idempotent, so it doesn't matter whether a peer's
  // state arrives before or after it. A failed load never falls back to an
  // editable blank board: it stays unloaded until retryLoad succeeds.
  useEffect(() => {
    if (!userId || !docGeneration) return;
    let cancelled = false;
    updatedAt.current = null;
    lastPersisted.current = null;
    loadedGeneration.current = 0;
    setLegacySeed(null);
    setIsLoading(true);
    setLoadError(null);

    authFetchRef
      .current(apiPath)
      .then(res =>
        res.ok
          ? (res.json() as Promise<NotepadDocument>)
          : Promise.reject(new Error(`${LOAD_ERROR_PREFIX}${res.status}`)),
      )
      .then(data => {
        if (cancelled) return;
        const savedContent = data?.content ?? '';
        updatedAt.current = data?.updatedAt ?? null;
        if (data?.yjsState) {
          applyState(data.yjsState);
          completeLoad(savedContent);
          return;
        }
        setLegacySeed({ content: savedContent, docGeneration });
      })
      .catch((error: Error) => {
        if (!cancelled) setLoadError(error.message);
      });

    return () => {
      cancelled = true;
    };
  }, [userId, apiPath, loadAttempt, docGeneration, applyState, completeLoad]);

  // Rows without Yjs state have only text to seed from. A peer that already
  // holds the doc answers the state request sent on SUBSCRIBED, so the seed
  // waits for that join plus a grace period, and is skipped if a peer's state
  // arrived. Two clients that both seed produce identical items (see
  // createTextSeedState), so even that race cannot double the text.
  useEffect(() => {
    if (!legacySeed || legacySeed.docGeneration !== docGeneration) return;
    if (connectionStatus === CONNECTION_STATUS.CONNECTING) return;
    const timer = setTimeout(
      () => {
        setLegacySeed(null);
        if (!getContent() && legacySeed.content) {
          applyState(createTextSeedState(legacySeed.content));
        }
        completeLoad(legacySeed.content);
      },
      connectionStatus === CONNECTION_STATUS.CONNECTED
        ? PEER_STATE_GRACE_MS
        : 0,
    );
    return () => clearTimeout(timer);
  }, [
    legacySeed,
    docGeneration,
    connectionStatus,
    applyState,
    getContent,
    completeLoad,
  ]);

  const retryLoad = useCallback(() => setLoadAttempt(prev => prev + 1), []);

  // persist is a dependency so a token refresh retries a failed save, but the
  // lastPersisted check keeps it from re-saving unchanged (or empty) text.
  useEffect(() => {
    if (isLoading || loadedGeneration.current !== docGeneration) return;
    if (room.content === lastPersisted.current) return;
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      saveTimeout.current = null;
      // A conflict merge may already have saved this text.
      if (getContent() === lastPersisted.current) return;
      persist();
    }, SAVE_DEBOUNCE_MS);
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = null;
    };
  }, [room.content, isLoading, docGeneration, getContent, persist]);

  // Closing the tab inside the debounce window would drop the last edit (a
  // clear made with no other device open included); keepalive lets the
  // request outlive the page.
  useEffect(() => {
    const flushPendingSave = () => {
      if (!saveTimeout.current) return;
      clearTimeout(saveTimeout.current);
      saveTimeout.current = null;
      persist(true);
    };
    window.addEventListener(PAGEHIDE_EVENT, flushPendingSave);
    return () => window.removeEventListener(PAGEHIDE_EVENT, flushPendingSave);
  }, [persist]);

  // After a failed load the editor stays read-only; show this browser's last
  // saved copy rather than a blank board when no peer has sent the doc.
  const content =
    loadError && !room.content ? (readCache()?.content ?? '') : room.content;

  return {
    content,
    setContent: room.setContent,
    isSaving: pendingSaves > 0,
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
