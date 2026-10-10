import { useCallback, useState } from 'react';

const USERNAME_STORAGE_KEY = 'balloono-username';
const USER_PREFIX = 'player-';
const USER_ID_LENGTH = 8;
const ID_RADIX = 36;
const NAME_SEPARATOR = '-';
const RANDOM_SPACE = 2 ** 32;
export const MAX_NAME_LENGTH = 16;

const NAME_ADJECTIVES = [
  'bouncy',
  'soggy',
  'zippy',
  'sneaky',
  'bubbly',
  'plucky',
  'splashy',
  'dizzy',
  'peppy',
  'squeaky',
];

const NAME_NOUNS = [
  'otter',
  'puffin',
  'newt',
  'duck',
  'seal',
  'frog',
  'squid',
  'koi',
  'crab',
  'gull',
];

const randomInt = (limit: number) => {
  const bucketSize = Math.floor(RANDOM_SPACE / limit);
  const cutoff = bucketSize * limit;
  const sample = new Uint32Array(1);
  do {
    crypto.getRandomValues(sample);
  } while (sample[0] >= cutoff);
  return Math.floor(sample[0] / bucketSize);
};

export const randomItem = <T>(items: readonly T[]): T =>
  items[randomInt(items.length)];

export const randomPhrase = () =>
  `${randomItem(NAME_ADJECTIVES)}${NAME_SEPARATOR}${randomItem(NAME_NOUNS)}`;

const randomUserId = () =>
  `${USER_PREFIX}${Array.from({ length: USER_ID_LENGTH }, () =>
    randomInt(ID_RADIX).toString(ID_RADIX),
  ).join('')}`;

const getOrCreate = (key: string, create: () => string) => {
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const value = create();
  localStorage.setItem(key, value);
  return value;
};

// The id is per page load rather than stored: two tabs sharing localStorage
// would otherwise join a room as the same presence key and fight over one
// seat. Only the display name persists. Rendered client-side only (`ssr:
// false`), so localStorage is safe to read during the first render.
export function usePlayerIdentity() {
  const [userId] = useState(randomUserId);
  const [username, setUsernameState] = useState(() =>
    getOrCreate(USERNAME_STORAGE_KEY, randomPhrase),
  );

  const setUsername = useCallback((name: string) => {
    const next = name.slice(0, MAX_NAME_LENGTH);
    setUsernameState(next);
    localStorage.setItem(USERNAME_STORAGE_KEY, next);
  }, []);

  return { userId, username, setUsername };
}
