import { Socket } from 'socket.io-client';
import {
  PUBLISH_ERROR_CODES,
  PublishAck,
  SOCKET_EVENTS,
} from '@vigilant-broccoli/common-js';
import {
  CHAT_APP,
  CHAT_PUBLISH_TIMEOUT_MS,
  CHAT_ROOM,
  ChatPayload,
} from '../../constants/chat';

const ERR_NOT_CONNECTED = 'Socket not connected';
const ERR_RECONNECT_TIMEOUT = 'Reconnect timeout';

const publish = (socket: Socket, payload: ChatPayload): Promise<PublishAck> =>
  socket.timeout(CHAT_PUBLISH_TIMEOUT_MS).emitWithAck(SOCKET_EVENTS.PUBLISH, {
    app: CHAT_APP,
    receiverId: CHAT_ROOM,
    payload,
  });

const reconnect = (socket: Socket) =>
  new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error(ERR_RECONNECT_TIMEOUT)),
      CHAT_PUBLISH_TIMEOUT_MS,
    );
    socket.once(SOCKET_EVENTS.CONNECT, () => {
      clearTimeout(timeout);
      resolve();
    });
    socket.disconnect().connect();
  });

// The server only checks the token during the handshake, so an expired token on
// a long-lived connection needs a reconnect to present a fresh one. The retry
// waits for `connect` because Socket.IO flushes buffered emits before firing it:
// a buffered publish would beat the resubscribe in the connect handler, and the
// sender would miss its own message.
export const publishOverSocket = async (
  socket: Socket | null,
  payload: ChatPayload,
) => {
  if (!socket) throw new Error(ERR_NOT_CONNECTED);
  const first = await publish(socket, payload);
  if (first.ok) return;
  if (first.code !== PUBLISH_ERROR_CODES.FORBIDDEN) throw new Error(first.code);
  await reconnect(socket);
  const retry = await publish(socket, payload);
  if (!retry.ok) throw new Error(retry.code);
};
