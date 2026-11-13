import type { Session } from '@supabase/supabase-js';

// An embedded frame cannot sign in itself: Google refuses to be framed, and a
// cross-site frame's storage is partitioned away from the first-party session.
// So /embed opens a popup that signs in first-party and posts the session back
// to its opener (the frame, same origin as the popup).
export const SIGN_IN_POPUP_NAME = 'tasks-next-sign-in';
export const SIGN_IN_POPUP_PATH = '/auth/popup';
export const SESSION_MESSAGE_TYPE = 'tasks-next:session';
export const STORAGE_KEY = 'tasks-next-auth';
// The popup keeps its session under its own key, so it never joins (and
// broadcasts to) a first-party tab's session, and can drop it after the
// handoff without a server sign-out, which would revoke the handed-off
// session too.
export const POPUP_STORAGE_KEY = 'tasks-next-popup-auth';
const POPUP_FEATURES = 'popup,width=480,height=640';

interface SessionMessage {
  type: typeof SESSION_MESSAGE_TYPE;
  access_token: string;
  refresh_token: string;
}

let popup: Window | null = null;

export const isSignInPopup = (): boolean =>
  typeof window !== 'undefined' && window.name === SIGN_IN_POPUP_NAME;

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

const clearPopupSession = () => {
  Object.keys(localStorage)
    .filter(key => key.startsWith(POPUP_STORAGE_KEY))
    .forEach(key => localStorage.removeItem(key));
};

// Used as AuthCallbackPage's onSession: true when this window is the popup and
// it handed the session over, so the callback skips its redirect.
export const handOffPopupSession = (session: Session | null): boolean => {
  if (!isSignInPopup() || !window.opener) return false;
  if (session) {
    const message: SessionMessage = {
      type: SESSION_MESSAGE_TYPE,
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    };
    window.opener.postMessage(message, window.location.origin);
  }
  clearPopupSession();
  window.close();
  return true;
};
