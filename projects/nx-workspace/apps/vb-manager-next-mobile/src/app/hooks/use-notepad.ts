'use client';

import {
  useNotepad as useSyncedNotepad,
  NotepadState,
  SupabaseBroadcastLike,
} from '@vigilant-broccoli/react-lib';
import { supabase } from '../../../libs/supabase';
import { buildAuthHeaders, useAuth } from '../providers/auth-provider';

const authFetch = async (
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> => {
  const hasJsonBody = typeof init.body === 'string';
  const headers = await buildAuthHeaders({ json: hasJsonBody });
  return fetch(input, { ...init, headers: { ...headers, ...init.headers } });
};

export const useNotepad = (): NotepadState => {
  const session = useAuth();
  return useSyncedNotepad({
    supabase: supabase as unknown as SupabaseBroadcastLike,
    authFetch,
    userId: session?.user.id ?? '',
  });
};
