import {
  createClient,
  RealtimeChannel,
  Session,
  SupabaseClient,
} from '@supabase/supabase-js';

// An embedded frame cannot sign in itself: Google refuses to be framed, and a
// cross-site frame's storage is partitioned away from the first-party session.
// So /embed opens a popup that signs in first-party and hands the session back
// to the frame: by postMessage to its opener, or, when the browser dropped the
// opener (or the window name) during the Google redirects, over a one-time
// Supabase Realtime channel, encrypted with a key that only ever travels in
// the popup URL's fragment.
const SIGN_IN_POPUP_NAME = 'tasks-next-sign-in';
const SIGN_IN_POPUP_PATH = '/auth/popup';
const SESSION_MESSAGE_TYPE = 'tasks-next:session';
export const STORAGE_KEY = 'tasks-next-auth';
// The popup keeps its session under its own key, so it never joins (and
// broadcasts to) a first-party tab's session, and can drop it after the
// handoff without a server sign-out, which would revoke the handed-off
// session too.
export const POPUP_STORAGE_KEY = 'tasks-next-popup-auth';
// sessionStorage survives the popup's cross-site redirects; window.name may not.
const HANDOFF_STORAGE_KEY = 'tasks-next-handoff';
const HANDOFF_HASH_PARAM = 'handoff';
const HANDOFF_CHANNEL_PREFIX = 'tasks-next-handoff:';
const HANDOFF_EVENT = 'session';
const SUBSCRIBED = 'SUBSCRIBED';
const POPUP_FEATURES = 'popup,width=480,height=640';
const KEY_BYTES = 32;
const IV_BYTES = 12;
const AES_GCM = 'AES-GCM';

interface SessionTokens {
  access_token: string;
  refresh_token: string;
}

interface SessionMessage extends SessionTokens {
  type: typeof SESSION_MESSAGE_TYPE;
}

interface EncryptedTokens {
  iv: string;
  data: string;
}

let popup: Window | null = null;
let handoffChannel: RealtimeChannel | null = null;
let deliverSession: ((tokens: SessionTokens) => void) | null = null;
let realtimeClient: SupabaseClient | null = null;

// Broadcast-only client; it must not own a stored session.
const getRealtimeClient = (): SupabaseClient => {
  realtimeClient ??= createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  );
  return realtimeClient;
};

const toBase64Url = (bytes: Uint8Array): string =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

type Bytes = Uint8Array<ArrayBuffer>;

const fromBase64Url = (value: string): Bytes =>
  Uint8Array.from(atob(value.replace(/-/g, '+').replace(/_/g, '/')), char =>
    char.charCodeAt(0),
  );

const importKey = (keyBytes: Bytes, usage: KeyUsage) =>
  crypto.subtle.importKey('raw', keyBytes, AES_GCM, false, [usage]);

const encryptTokens = async (
  tokens: SessionTokens,
  keyBytes: Bytes,
): Promise<EncryptedTokens> => {
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const data = await crypto.subtle.encrypt(
    { name: AES_GCM, iv },
    await importKey(keyBytes, 'encrypt'),
    new TextEncoder().encode(JSON.stringify(tokens)),
  );
  return { iv: toBase64Url(iv), data: toBase64Url(new Uint8Array(data)) };
};

const decryptTokens = async (
  { iv, data }: EncryptedTokens,
  keyBytes: Bytes,
): Promise<SessionTokens> => {
  const plaintext = await crypto.subtle.decrypt(
    { name: AES_GCM, iv: fromBase64Url(iv) },
    await importKey(keyBytes, 'decrypt'),
    fromBase64Url(data),
  );
  return JSON.parse(new TextDecoder().decode(plaintext));
};

const readStoredHandoff = (): string | null => {
  try {
    return sessionStorage.getItem(HANDOFF_STORAGE_KEY);
  } catch {
    return null;
  }
};

export const isSignInPopup = (): boolean =>
  typeof window !== 'undefined' &&
  (window.name === SIGN_IN_POPUP_NAME || !!readStoredHandoff());

// Called on /auth/popup before Google sign-in: keeps the frame's one-time
// handoff (channel nonce and key) for the callback.
export const rememberPopupHandoff = () => {
  const handoff = new URLSearchParams(window.location.hash.slice(1)).get(
    HANDOFF_HASH_PARAM,
  );
  if (!handoff) return;
  try {
    sessionStorage.setItem(HANDOFF_STORAGE_KEY, handoff);
  } catch {
    // Without sessionStorage only the opener path remains.
  }
};

const listenOnHandoffChannel = (nonce: string, keyBytes: Bytes) => {
  if (handoffChannel) void getRealtimeClient().removeChannel(handoffChannel);
  handoffChannel = getRealtimeClient()
    .channel(`${HANDOFF_CHANNEL_PREFIX}${nonce}`)
    .on('broadcast', { event: HANDOFF_EVENT }, ({ payload }) => {
      void decryptTokens(payload as EncryptedTokens, keyBytes)
        .then(tokens => deliverSession?.(tokens))
        .catch(() => undefined);
    })
    .subscribe();
};

// window.open runs before any await so the click's user activation still
// allows the popup.
export const openSignInPopup = async (): Promise<void> => {
  const nonce = crypto.randomUUID();
  const keyBytes = crypto.getRandomValues(new Uint8Array(KEY_BYTES));
  const hash = new URLSearchParams({
    [HANDOFF_HASH_PARAM]: `${nonce}.${toBase64Url(keyBytes)}`,
  });
  popup = window.open(
    `${SIGN_IN_POPUP_PATH}#${hash}`,
    SIGN_IN_POPUP_NAME,
    POPUP_FEATURES,
  );
  listenOnHandoffChannel(nonce, keyBytes);
};

const isSessionMessage = (event: MessageEvent): boolean =>
  event.origin === window.location.origin &&
  event.source === popup &&
  (event.data as SessionMessage | null)?.type === SESSION_MESSAGE_TYPE;

export const listenForPopupSession = (
  onSession: (tokens: SessionTokens) => void,
): (() => void) => {
  deliverSession = onSession;
  const handleMessage = (event: MessageEvent) => {
    if (!isSessionMessage(event)) return;
    const { access_token, refresh_token } = event.data as SessionMessage;
    onSession({ access_token, refresh_token });
  };
  window.addEventListener('message', handleMessage);
  return () => {
    deliverSession = null;
    window.removeEventListener('message', handleMessage);
  };
};

const broadcastTokens = async (tokens: SessionTokens, handoff: string) => {
  const [nonce, key] = handoff.split('.');
  const payload = await encryptTokens(tokens, fromBase64Url(key));
  const client = getRealtimeClient();
  const channel = client.channel(`${HANDOFF_CHANNEL_PREFIX}${nonce}`, {
    config: { broadcast: { ack: true } },
  });
  await new Promise<void>(resolve => {
    channel.subscribe(status => {
      if (status === SUBSCRIBED) resolve();
    });
  });
  await channel.send({ type: 'broadcast', event: HANDOFF_EVENT, payload });
  await client.removeChannel(channel);
};

const clearPopupState = () => {
  Object.keys(localStorage)
    .filter(key => key.startsWith(POPUP_STORAGE_KEY))
    .forEach(key => localStorage.removeItem(key));
  try {
    sessionStorage.removeItem(HANDOFF_STORAGE_KEY);
  } catch {
    // Nothing stored.
  }
};

const handOff = async (session: Session | null, handoff: string | null) => {
  if (session) {
    const tokens = {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    };
    // Both when available; the frame adopting the same tokens twice is a no-op.
    if (window.opener) {
      const message: SessionMessage = { type: SESSION_MESSAGE_TYPE, ...tokens };
      window.opener.postMessage(message, window.location.origin);
    }
    if (handoff) await broadcastTokens(tokens, handoff).catch(() => undefined);
  }
  clearPopupState();
  window.close();
};

// Used as AuthCallbackPage's onSession: true when this window is the popup, so
// the callback skips its redirect and hands the session over instead.
export const handOffPopupSession = (session: Session | null): boolean => {
  if (!isSignInPopup()) return false;
  void handOff(session, readStoredHandoff());
  return true;
};
