'use client';

import { useCallback } from 'react';
import {
  AUTHORIZATION_HEADER,
  BEARER_PREFIX,
} from '@vigilant-broccoli/common-js';
import {
  NotepadState,
  SupabaseBroadcastLike,
  useNotepad,
} from '@vigilant-broccoli/react-lib';
import { supabase } from '../../../libs/supabase';

const WHITEBOARD_API = '/api/whiteboard';
const STORAGE_KEY_PREFIX = 'whiteboard:content:';
const ROOM_CHANNEL_PREFIX = 'whiteboard-room-';
const DEFAULT_BOARD_KEY = 'family';

export const useWhiteboard = (
  homeId: number | null,
  token: string,
  userId: string,
  username: string,
  boardKey: string = DEFAULT_BOARD_KEY,
): NotepadState => {
  const authFetch = useCallback(
    (input: RequestInfo | URL, init?: RequestInit) =>
      fetch(input, {
        ...init,
        headers: {
          ...init?.headers,
          [AUTHORIZATION_HEADER]: `${BEARER_PREFIX}${token}`,
        },
      }),
    [token],
  );

  return useNotepad({
    supabase: supabase as unknown as SupabaseBroadcastLike,
    authFetch,
    userId,
    username,
    channelName: `${ROOM_CHANNEL_PREFIX}${homeId}-${boardKey}`,
    apiPath: `${WHITEBOARD_API}?homeId=${homeId}&boardKey=${boardKey}`,
    storageKey: `${STORAGE_KEY_PREFIX}${homeId}:${boardKey}`,
  });
};
