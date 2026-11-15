import { type RefObject, useEffect } from 'react';
import {
  EMBED_SESSION,
  type EmbedSessionMessage,
  isEmbedSessionMessage,
} from '@vigilant-broccoli/common-js';

// The parent side of EMBED_SESSION, for a page that frames an embed with
// `?session=parent`. It answers only its own frame at `frameOrigin` and posts
// only to that origin, so another page or frame never receives a token.
export const useEmbedSessionProvider = ({
  frameRef,
  frameOrigin,
  accessToken,
  getAccessToken,
  signIn,
}: {
  frameRef: RefObject<HTMLIFrameElement | null>;
  frameOrigin: string;
  // The session's current token; a change (sign-in, refresh, sign-out) is
  // pushed to the frame.
  accessToken: string | null;
  // Answers requests; should refresh an expired token, as supabase-js
  // getSession() does.
  getAccessToken: () => Promise<string | null>;
  signIn: () => void | Promise<void>;
}) => {
  useEffect(() => {
    const post = (message: EmbedSessionMessage) =>
      frameRef.current?.contentWindow?.postMessage(message, frameOrigin);

    const onMessage = async (event: MessageEvent) => {
      if (
        !frameRef.current ||
        event.source !== frameRef.current.contentWindow ||
        event.origin !== frameOrigin ||
        !isEmbedSessionMessage(event.data)
      )
        return;
      if (event.data.type === EMBED_SESSION.MESSAGE.SIGN_IN) {
        void signIn();
        return;
      }
      if (event.data.type !== EMBED_SESSION.MESSAGE.REQUEST) return;
      const { id } = event.data;
      post({
        type: EMBED_SESSION.MESSAGE.TOKEN,
        id,
        accessToken: await getAccessToken(),
      });
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [frameRef, frameOrigin, getAccessToken, signIn]);

  // Before the frame loads, its window is still about:blank, so the target
  // origin check drops this; the frame's first request covers that case.
  useEffect(() => {
    frameRef.current?.contentWindow?.postMessage(
      {
        type: EMBED_SESSION.MESSAGE.TOKEN,
        accessToken,
      } satisfies EmbedSessionMessage,
      frameOrigin,
    );
  }, [frameRef, frameOrigin, accessToken]);
};
