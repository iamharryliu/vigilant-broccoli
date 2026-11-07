'use client';

import { ReactNode, createContext, useContext } from 'react';
import {
  useNotepad as useSyncedNotepad,
  NotepadState,
  SupabaseBroadcastLike,
} from '@vigilant-broccoli/react-lib-higher-level';
import { supabase } from '../../lib/supabase';
import { authFetch, useAuth } from '../../../libs/auth';

const NotepadContext = createContext<NotepadState | null>(null);

// One synced notepad per tab, shared by every editor (Home tab, dialog,
// /notepad). realtime-js hands out one channel per topic, so a second
// useSyncedNotepad would subscribe 'notepad-room' twice and, when the dialog
// closed, remove the channel from under the Home tab's editor.
export const NotepadProvider = ({ children }: { children: ReactNode }) => {
  const session = useAuth();
  const notepad = useSyncedNotepad({
    supabase: supabase as unknown as SupabaseBroadcastLike,
    authFetch,
    userId: session?.user.id ?? '',
    accessToken: session?.access_token ?? null,
  });
  return (
    <NotepadContext.Provider value={notepad}>
      {children}
    </NotepadContext.Provider>
  );
};

export const useNotepad = (): NotepadState => {
  const notepad = useContext(NotepadContext);
  if (!notepad)
    throw new Error('useNotepad must be used inside NotepadProvider');
  return notepad;
};
