'use client';

import { HTTP_METHOD } from '@vigilant-broccoli/common-js';
import {
  ChatPanel,
  ChatPayload,
} from '@vigilant-broccoli/react-lib-higher-level';
import { API_ENDPOINTS } from '../../constants/api-endpoints';
import { useDemoChatRoom } from '../../hooks/useDemoChatRoom';
import { publishOverSocket } from './chat-socket-publish';

const DESCRIPTION =
  'Connects with a short-lived token for this room only, then sends over the socket. Works without signing in.';

const fetchRoomToken = async (): Promise<string | undefined> => {
  const res = await fetch(API_ENDPOINTS.CHAT_TOKEN, {
    method: HTTP_METHOD.POST,
  });
  const body: { token?: string } = await res.json();
  return body.token;
};

const SOCKET_OPTIONS: Parameters<typeof useDemoChatRoom>[0] = {
  reconnection: true,
  // A function so every reconnect requests a new token, since tokens expire.
  auth: callback => {
    void fetchRoomToken()
      .then(token => callback({ token }))
      .catch(() => callback({}));
  },
};

export function RoomTokenChatDemo() {
  const { socket, status, messages } = useDemoChatRoom(SOCKET_OPTIONS);
  return (
    <ChatPanel
      description={DESCRIPTION}
      status={status}
      messages={messages}
      onSend={(payload: ChatPayload) => publishOverSocket(socket, payload)}
    />
  );
}
