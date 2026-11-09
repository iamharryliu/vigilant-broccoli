export const SOCKET_EVENTS = {
  CONNECTION: 'connection',
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
  SUBSCRIBE: 'subscribe',
  UNSUBSCRIBE: 'unsubscribe',
  PUBLISH: 'publish',
  MESSAGE: 'message',
} as const;

export type SocketEvent = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];

export const SOCKET_SERVER_PATHS = {
  HEALTH: '/health',
  EVENTS: '/events',
  PUBLISH: '/publish',
} as const;

export const SOCKET_SUBSCRIPTION_PARAMS = {
  APP: 'app',
  RECEIVER_ID: 'receiverId',
} as const;

export const SSE_CONTENT_TYPE = 'text/event-stream';

export const PUBLISH_ERROR_CODES = {
  FORBIDDEN: 'forbidden',
  INVALID: 'invalid',
  RATE_LIMITED: 'rate_limited',
} as const;

export type PublishErrorCode =
  (typeof PUBLISH_ERROR_CODES)[keyof typeof PUBLISH_ERROR_CODES];

export type PublishAck =
  | { ok: true; receivers?: number }
  | { ok: false; code: PublishErrorCode; issues?: unknown };
