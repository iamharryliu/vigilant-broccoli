export const APP_NAME = 'Chat';
export const APP_DESCRIPTION = 'A private chat room.';
export const PAGE_TITLE = { HOME: 'Room' } as const;

// Not shared with local-manager-next's `chat-demo` app, which guests can
// publish to with room tokens.
export const CHAT_APP = 'chat';
// Staging and production share one socket server, so each environment gets
// its own room. Direct access so Next.js inlines it into the client bundle.
export const CHAT_ROOM = process.env.NEXT_PUBLIC_CHAT_ROOM || 'local';
export const MAX_MESSAGE_LENGTH = 2000;
export const MAX_SENDER_LENGTH = 64;

export const API_ROUTE = { PUBLISH: '/api/publish' } as const;
