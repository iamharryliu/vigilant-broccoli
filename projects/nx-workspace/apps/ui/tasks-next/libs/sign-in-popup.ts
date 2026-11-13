import type { Session } from '@supabase/supabase-js';

// An embedded frame cannot sign in itself: Google refuses to be framed, and a
// cross-site frame's storage is partitioned away from the first-party session.
// So /embed opens a popup that signs in first-party and posts the session back
// to its opener (the frame, same origin as the popup). The target origin keeps
// a popup opened by another site from posting the session to that site; do not
// add a handoff channel the popup cannot tie to its opener.
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
const POPUP_MARKER_KEY = 'tasks-next-sign-in-popup';
const POPUP_FEATURES = 'popup,width=480,height=640';

export const HANDOFF_RESULT = {
  NOT_POPUP: 'not-popup',
  HANDED_OFF: 'handed-off',
  NO_OPENER: 'no-opener',
} as const;

type HandoffResult = (typeof HANDOFF_RESULT)[keyof typeof HANDOFF_RESULT];

interface SessionMessage {
  type: typeof SESSION_MESSAGE_TYPE;
  access_token: string;
  refresh_token: string;
}

let popup: Window | null = null;

const hasPopupMarker = (): boolean => {
  try {
    return !!sessionStorage.getItem(POPUP_MARKER_KEY);
  } catch {
    return false;
  }
};

export const isSignInPopup = (): boolean =>
  typeof window !== 'undefined' &&
  (window.name === SIGN_IN_POPUP_NAME || hasPopupMarker());

// Called on /auth/popup before Google sign-in.
export const markSignInPopup = () => {
  if (window.name !== SIGN_IN_POPUP_NAME) return;
  try {
    sessionStorage.setItem(POPUP_MARKER_KEY, '1');
  } catch {
    // window.name alone still marks the popup.
  }
};

export const openSignInPopup = async (): Promise<void> => {
  popup = window.open(SIGN_IN_POPUP_PATH, SIGN_IN_POPUP_NAME, POPUP_FEATURES);
};

const isSessionMessage = (event: MessageEvent): boolean =>
  event.origin === window.location.origin &&
  event.source === popup &&
  (event.data as SessionMessage | null)?.type === SESSION_MESSAGE_TYPE;

export const listenForPopupSession = (
  onSession: (tokens: { access_token: string; refresh_token: string }) => void,
): (() => void) => {
  const handleMessage = (event: MessageEvent) => {
    if (!isSessionMessage(event)) return;
    const { access_token, refresh_token } = event.data as SessionMessage;
    onSession({ access_token, refresh_token });
  };
  window.addEventListener('message', handleMessage);
  return () => window.removeEventListener('message', handleMessage);
};

const clearPopupState = () => {
  Object.keys(localStorage)
    .filter(key => key.startsWith(POPUP_STORAGE_KEY))
    .forEach(key => localStorage.removeItem(key));
  try {
    sessionStorage.removeItem(POPUP_MARKER_KEY);
  } catch {
    // Nothing stored.
  }
};

// On /auth/callback: NOT_POPUP keeps the normal redirect; otherwise the popup
// drops its session and either hands it to the opener and closes, or stays
// open to say the handoff failed.
export const handOffPopupSession = (session: Session | null): HandoffResult => {
  if (!isSignInPopup()) return HANDOFF_RESULT.NOT_POPUP;
  const opener = window.opener as Window | null;
  clearPopupState();
  if (!opener) return HANDOFF_RESULT.NO_OPENER;
  if (session) {
    const message: SessionMessage = {
      type: SESSION_MESSAGE_TYPE,
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    };
    opener.postMessage(message, window.location.origin);
  }
  window.close();
  return HANDOFF_RESULT.HANDED_OFF;
};
