// Server-safe: route handlers import this through the `chat-room-consts` path
// alias instead of the lib barrel, which also loads client components.
export const CHAT_DEMO_APP = 'chat-demo';
export const CHAT_DEMO_ROOM = 'lobby';
export const CHAT_PUBLISH_TIMEOUT_MS = 5000;

export const CHAT_STATUS = {
  CONNECTING: 'connecting',
  OPEN: 'open',
  CLOSED: 'closed',
} as const;

export type ChatStatus = (typeof CHAT_STATUS)[keyof typeof CHAT_STATUS];

export interface ChatPayload {
  text: string;
  sender: string;
  ts: number;
}

export interface ChatRoomMessage {
  app: string;
  receiverId: string;
  payload: ChatPayload;
}
