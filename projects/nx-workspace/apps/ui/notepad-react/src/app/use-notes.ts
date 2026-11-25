import { useCallback, useEffect, useState } from 'react';
import {
  createNote,
  NOTES_STORAGE_KEY,
  Note,
  readNotes,
  readSelectedId,
  writeNotes,
  writeSelectedId,
} from './notepad.storage';

const initialNotes = () => {
  const notes = readNotes();
  return notes.length ? notes : [createNote()];
};

const sortNewestFirst = (notes: Note[]) =>
  [...notes].sort((a, b) => b.updatedAt - a.updatedAt);

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [selectedId, setSelectedId] = useState<string>(() => {
    const saved = readSelectedId();
    return notes.find(note => note.id === saved)?.id ?? notes[0].id;
  });

  useEffect(() => writeNotes(notes), [notes]);
  useEffect(() => writeSelectedId(selectedId), [selectedId]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== NOTES_STORAGE_KEY) return;
      const next = readNotes();
      if (next.length) setNotes(next);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const selected = notes.find(note => note.id === selectedId) ?? notes[0];

  const addNote = useCallback(() => {
    const note = createNote();
    setNotes(prev => [note, ...prev]);
    setSelectedId(note.id);
  }, []);

  const updateSelected = useCallback(
    (content: string) =>
      setNotes(prev =>
        prev.map(note =>
          note.id === selected.id
            ? { ...note, content, updatedAt: Date.now() }
            : note,
        ),
      ),
    [selected.id],
  );

  const deleteNote = useCallback(
    (id: string) => {
      const remaining = notes.filter(note => note.id !== id);
      const next = remaining.length ? remaining : [createNote()];
      setNotes(next);
      if (id === selectedId) setSelectedId(sortNewestFirst(next)[0].id);
    },
    [notes, selectedId],
  );

  return {
    notes: sortNewestFirst(notes),
    selected,
    select: setSelectedId,
    addNote,
    updateSelected,
    deleteNote,
  };
};
