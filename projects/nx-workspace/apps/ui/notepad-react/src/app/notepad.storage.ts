export interface Note {
  id: string;
  content: string;
  updatedAt: number;
}

export const NOTES_STORAGE_KEY = 'notepad-react:notes';
export const SELECTED_STORAGE_KEY = 'notepad-react:selected';

const isNote = (value: unknown): value is Note =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as Note).id === 'string' &&
  typeof (value as Note).content === 'string' &&
  typeof (value as Note).updatedAt === 'number';

export const readNotes = (): Note[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(NOTES_STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter(isNote) : [];
  } catch {
    return [];
  }
};

export const writeNotes = (notes: Note[]) => {
  try {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
  } catch {
    // Storage can be full or blocked (private mode); the in-memory notes still work.
  }
};

export const readSelectedId = () => {
  try {
    return localStorage.getItem(SELECTED_STORAGE_KEY);
  } catch {
    return null;
  }
};

export const writeSelectedId = (id: string | null) => {
  try {
    if (id) localStorage.setItem(SELECTED_STORAGE_KEY, id);
    else localStorage.removeItem(SELECTED_STORAGE_KEY);
  } catch {
    // See writeNotes.
  }
};

export const createNote = (): Note => ({
  id: crypto.randomUUID(),
  content: '',
  updatedAt: Date.now(),
});

export const getNoteTitle = (note: Note, fallback: string) =>
  note.content
    .split('\n')
    .find(line => line.trim())
    ?.trim() || fallback;
