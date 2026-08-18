'use client';

import {
  useNotepad as useSyncedNotepad,
  NotepadState,
} from '@vigilant-broccoli/react-lib';
import { supabase } from '../../lib/supabase';
import { authFetch } from '../../../libs/auth';

export const useNotepad = (): NotepadState =>
  useSyncedNotepad({ supabase, authFetch });
