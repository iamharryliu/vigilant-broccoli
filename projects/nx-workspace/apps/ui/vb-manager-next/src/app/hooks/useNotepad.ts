'use client';

import {
  useNotepad as useSyncedNotepad,
  NotepadState,
  SupabaseBroadcastLike,
} from '@vigilant-broccoli/react-lib';
import { supabase } from '../../lib/supabase';
import { authFetch, useAuth } from '../../../libs/auth';

export const useNotepad = (): NotepadState => {
  const session = useAuth();
  return useSyncedNotepad({
    supabase: supabase as unknown as SupabaseBroadcastLike,
    authFetch,
    userId: session?.user.id ?? '',
  });
};
