'use client';

import { useCallback, useRef, useState } from 'react';

const STORAGE_KEY = 'language-learning-seen-words';

const readStored = (): string[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed)
      ? parsed.filter((word): word is string => typeof word === 'string')
      : [];
  } catch {
    return [];
  }
};

// English words already shown, oldest first, kept per browser. The ref lets
// callbacks read the latest list without re-creating on every change.
export const useSeenWords = () => {
  const [seen, setSeen] = useState<string[]>([]);
  const seenRef = useRef<string[]>([]);

  const commit = useCallback((next: string[]) => {
    seenRef.current = next;
    setSeen(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Private mode or blocked storage: the list lasts for this visit only.
    }
  }, []);

  const hydrate = useCallback(() => {
    const stored = readStored();
    seenRef.current = stored;
    setSeen(stored);
  }, []);

  const add = useCallback(
    (word: string) => {
      const others = seenRef.current.filter(
        seenWord => seenWord.toLowerCase() !== word.toLowerCase(),
      );
      commit([...others, word]);
    },
    [commit],
  );

  const remove = useCallback(
    (word: string) => commit(seenRef.current.filter(w => w !== word)),
    [commit],
  );

  const clear = useCallback(() => commit([]), [commit]);

  return { seen, seenRef, hydrate, add, remove, clear };
};
