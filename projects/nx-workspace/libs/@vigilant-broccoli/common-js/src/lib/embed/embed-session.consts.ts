// An embed loaded with `?session=parent` borrows its parent page's Supabase
// session over postMessage instead of signing in itself: the frame REQUESTs a
// token before each API call, the parent answers with its current access
// TOKEN (and pushes one on every auth change), and the frame forwards its
// sign-in button as SIGN_IN. Only access tokens cross: a shared rotating
// refresh token would let one side's refresh revoke the other's session.
export const EMBED_SESSION = {
  PARAM: 'session',
  PARENT: 'parent',
  MESSAGE: {
    REQUEST: 'embed-session-request',
    TOKEN: 'embed-session-token',
    SIGN_IN: 'embed-session-sign-in',
  },
} as const;

export type EmbedSessionMessage =
  | { type: typeof EMBED_SESSION.MESSAGE.REQUEST; id: string }
  | {
      type: typeof EMBED_SESSION.MESSAGE.TOKEN;
      // Set when answering a REQUEST; absent on pushes.
      id?: string;
      accessToken: string | null;
    }
  | { type: typeof EMBED_SESSION.MESSAGE.SIGN_IN };

const MESSAGE_TYPES: readonly string[] = Object.values(EMBED_SESSION.MESSAGE);

export const isEmbedSessionMessage = (
  data: unknown,
): data is EmbedSessionMessage =>
  typeof data === 'object' &&
  data !== null &&
  MESSAGE_TYPES.includes((data as { type?: unknown }).type as string);
