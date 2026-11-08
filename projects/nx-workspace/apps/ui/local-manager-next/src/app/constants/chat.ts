export const CHAT_APP = 'chat-demo';
export const CHAT_ROOM = 'lobby';
export const CHAT_CONNECT_TIMEOUT_MS = 5000;
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
