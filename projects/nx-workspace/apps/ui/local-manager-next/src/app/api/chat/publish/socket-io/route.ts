import { PublishAck, SOCKET_EVENTS } from '@vigilant-broccoli/common-js';
import { io } from 'socket.io-client';
import {
  CHAT_APP,
  CHAT_CONNECT_TIMEOUT_MS,
  CHAT_PUBLISH_TIMEOUT_MS,
  CHAT_ROOM,
  ChatPayload,
} from '../../../../constants/chat';
import { createChatPublishHandler } from '../create-chat-publish-handler';

const LOG_PREFIX = '[chat/publish/socket-io]';
const ERR_CONNECT_TIMEOUT = 'Socket connect timeout';
const ERR_PUBLISH_TIMEOUT = 'Publish ack timeout';

const publishOverSocket = async (
  url: string,
  token: string,
  payload: ChatPayload,
): Promise<PublishAck> => {
  const socket = io(url, {
    auth: { token },
    transports: ['websocket'],
    reconnection: false,
  });

  try {
    await new Promise<void>((resolve, reject) => {
      const t = setTimeout(
        () => reject(new Error(ERR_CONNECT_TIMEOUT)),
        CHAT_CONNECT_TIMEOUT_MS,
      );
      socket.once(SOCKET_EVENTS.CONNECT, () => {
        clearTimeout(t);
        resolve();
      });
      socket.once(SOCKET_EVENTS.CONNECT_ERROR, err => {
        clearTimeout(t);
        reject(err);
      });
    });

    return await new Promise<PublishAck>((resolve, reject) => {
      const t = setTimeout(
        () => reject(new Error(ERR_PUBLISH_TIMEOUT)),
        CHAT_PUBLISH_TIMEOUT_MS,
      );
      socket.emit(
        SOCKET_EVENTS.PUBLISH,
        { app: CHAT_APP, receiverId: CHAT_ROOM, payload },
        (res: PublishAck) => {
          clearTimeout(t);
          resolve(res);
        },
      );
    });
  } finally {
    socket.close();
  }
};

export const POST = createChatPublishHandler(LOG_PREFIX, publishOverSocket);
