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

export const PUBLISH_ERROR_CODES = {
  FORBIDDEN: 'forbidden',
  INVALID: 'invalid',
} as const;

export type PublishErrorCode =
  (typeof PUBLISH_ERROR_CODES)[keyof typeof PUBLISH_ERROR_CODES];

export type PublishAck =
  | { ok: true }
  | { ok: false; code: PublishErrorCode; issues?: unknown };
