'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const SAVE_DEBOUNCE_MS = 1000;

interface NotepadState {
  content: string;
  setContent: (content: string) => void;
  isSaving: boolean;
  lastSaved: Date | null;
}

export const useNotepad = (): NotepadState => {
  const [content, setContentState] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    fetch('/api/notepad')
      .then(res => res.json())
      .then(data => {
        setContentState(data.content ?? '');
        isInitialized.current = true;
      })
      .catch(() => {
        isInitialized.current = true;
      });
  }, []);

  const saveContent = useCallback((text: string) => {
    setIsSaving(true);
    fetch('/api/notepad', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: text }),
    })
      .then(() => setLastSaved(new Date()))
      .finally(() => setIsSaving(false));
  }, []);

  const setContent = useCallback(
    (text: string) => {
      setContentState(text);
      if (!isInitialized.current) return;

      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(
        () => saveContent(text),
        SAVE_DEBOUNCE_MS,
      );
    },
    [saveContent],
  );

  return { content, setContent, isSaving, lastSaved };
};
