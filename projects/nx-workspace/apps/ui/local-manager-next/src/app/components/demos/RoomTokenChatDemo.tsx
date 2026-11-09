'use client';

import { HTTP_METHOD } from '@vigilant-broccoli/common-js';
import { API_ENDPOINTS } from '../../constants/api-endpoints';
import { ChatPayload } from '../../constants/chat';
import { useChatRoom } from '../../hooks/useChatRoom';
import { publishOverSocket } from './chat-socket-publish';
import { ChatDemoPanel } from './ChatDemoPanel';

const DESCRIPTION =
  'Connects with a short-lived token for this room only, then sends over the socket. Works without signing in.';

const fetchRoomToken = async (): Promise<string | undefined> => {
  const res = await fetch(API_ENDPOINTS.CHAT_TOKEN, {
    method: HTTP_METHOD.POST,
  });
  const body: { token?: string } = await res.json();
  return body.token;
};

const SOCKET_OPTIONS: Parameters<typeof useChatRoom>[0] = {
  reconnection: true,
  // A function so every reconnect requests a new token, since tokens expire.
  auth: callback => {
    void fetchRoomToken()
      .then(token => callback({ token }))
      .catch(() => callback({}));
  },
};

export function RoomTokenChatDemo() {
  const { socket, status, messages } = useChatRoom(SOCKET_OPTIONS);
  return (
    <ChatDemoPanel
      description={DESCRIPTION}
      status={status}
      messages={messages}
      onSend={(payload: ChatPayload) => publishOverSocket(socket, payload)}
    />
  );
}
