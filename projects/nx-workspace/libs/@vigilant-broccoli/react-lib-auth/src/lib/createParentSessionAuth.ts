import { useSyncExternalStore } from 'react';
import {
  AUTHORIZATION_HEADER,
  BEARER_PREFIX,
  CONTENT_TYPE_HEADER,
  EMBED_SESSION,
  type EmbedSessionMessage,
  JSON_CONTENT_TYPE,
  isEmbedSessionMessage,
} from '@vigilant-broccoli/common-js';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

// A parent that never answers (not embedded by a session-sharing page) leaves
// the frame signed out instead of loading forever.
const REQUEST_TIMEOUT_MS = 5000;

// ancestorOrigins is missing in Firefox, where the referrer still carries the
// embedding origin under the default referrer policy.
const getEmbeddingOrigin = (): string | null =>
  window.location.ancestorOrigins?.[0] ??
  (document.referrer ? new URL(document.referrer).origin : null);

// The frame side of EMBED_SESSION: never stores or refreshes a session, and
// asks the parent for a current access token before every request, so expiry
// and refresh stay with the parent's single session owner.
export const createParentSessionAuth = ({
  isAllowedParentOrigin,
}: {
  isAllowedParentOrigin: (origin: string) => boolean;
}) => {
  // undefined until first use: window is unavailable while server rendering.
  let parentOrigin: string | null | undefined;
  let status: AuthStatus = 'loading';
  let hasRequestedStatus = false;
  const listeners = new Set<() => void>();
  const pendingRequests = new Map<string, (token: string | null) => void>();

  const setStatus = (next: AuthStatus) => {
    if (next === status) return;
    status = next;
    listeners.forEach(listener => listener());
  };

  const onMessage = (event: MessageEvent) => {
    if (
      event.source !== window.parent ||
      event.origin !== parentOrigin ||
      !isEmbedSessionMessage(event.data) ||
      event.data.type !== EMBED_SESSION.MESSAGE.TOKEN
    )
      return;
    const { id, accessToken } = event.data;
    setStatus(accessToken ? 'authenticated' : 'unauthenticated');
    if (!id) return;
    pendingRequests.get(id)?.(accessToken);
    pendingRequests.delete(id);
  };

  const resolveParentOrigin = (): string | null => {
    if (parentOrigin !== undefined) return parentOrigin;
    const origin = window.parent === window ? null : getEmbeddingOrigin();
    parentOrigin = origin && isAllowedParentOrigin(origin) ? origin : null;
    if (parentOrigin) window.addEventListener('message', onMessage);
    return parentOrigin;
  };

  const post = (origin: string, message: EmbedSessionMessage) =>
    window.parent.postMessage(message, origin);

  const requestAccessToken = (): Promise<string | null> => {
    const origin = resolveParentOrigin();
    if (!origin) {
      setStatus('unauthenticated');
      return Promise.resolve(null);
    }
    return new Promise(resolve => {
      const id = crypto.randomUUID();
      const timeout = setTimeout(() => {
        pendingRequests.delete(id);
        if (status === 'loading') setStatus('unauthenticated');
        resolve(null);
      }, REQUEST_TIMEOUT_MS);
      pendingRequests.set(id, token => {
        clearTimeout(timeout);
        resolve(token);
      });
      post(origin, { type: EMBED_SESSION.MESSAGE.REQUEST, id });
    });
  };

  const authFetch = async (
    input: RequestInfo | URL,
    init: RequestInit = {},
  ): Promise<Response> => {
    const accessToken = await requestAccessToken();
    const headers: Record<string, string> = {};
    if (accessToken) {
      headers[AUTHORIZATION_HEADER] = `${BEARER_PREFIX}${accessToken}`;
    }
    if (typeof init.body === 'string') {
      headers[CONTENT_TYPE_HEADER] = JSON_CONTENT_TYPE;
    }
    return fetch(input, { ...init, headers: { ...headers, ...init.headers } });
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    if (!hasRequestedStatus) {
      hasRequestedStatus = true;
      void requestAccessToken();
    }
    return () => {
      listeners.delete(listener);
    };
  };

  const useAuthStatus = (): AuthStatus =>
    useSyncExternalStore(
      subscribe,
      () => status,
      () => 'loading',
    );

  // Sign-in and Google reconnect run in the parent, which owns the session.
  const signInWithGoogle = async () => {
    const origin = resolveParentOrigin();
    if (origin) post(origin, { type: EMBED_SESSION.MESSAGE.SIGN_IN });
  };

  return { authFetch, useAuthStatus, signInWithGoogle };
};
