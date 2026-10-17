const SESSION_STORAGE_KEY = 'okin-demo-session';
const USER_STORAGE_KEY = 'okin-demo-user';
const SESSION_ID_BYTES = 18;

const readStorage = (key: string): string | null => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeStorage = (key: string, value: string) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage can be unavailable (private mode); the session then lasts one page load.
  }
};

const randomSessionId = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(SESSION_ID_BYTES));
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
};

let memorySessionId: string | null = null;

// The service keeps this visitor's home view, modals and messages under this id.
export const getSessionId = (): string => {
  const stored = readStorage(SESSION_STORAGE_KEY) ?? memorySessionId;
  if (stored) return stored;
  const created = randomSessionId();
  memorySessionId = created;
  writeStorage(SESSION_STORAGE_KEY, created);
  return created;
};

export const getStoredUserId = () => readStorage(USER_STORAGE_KEY);
export const storeUserId = (userId: string) =>
  writeStorage(USER_STORAGE_KEY, userId);
