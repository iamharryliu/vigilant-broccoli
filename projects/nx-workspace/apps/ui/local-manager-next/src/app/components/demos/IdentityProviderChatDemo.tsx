'use client';

import { ChatPayload } from '../../constants/chat';
import { useChatRoom } from '../../hooks/useChatRoom';
import { getSupabaseAccessToken } from '../../../../libs/auth';
import { publishOverSocket } from './chat-socket-publish';
import { ChatDemoPanel } from './ChatDemoPanel';

const DESCRIPTION =
  'Connects with your Supabase JWT, which the socket server verifies, then sends over the socket. Sending requires sign-in.';

const SOCKET_OPTIONS: Parameters<typeof useChatRoom>[0] = {
  reconnection: true,
  // A function so every reconnect sends the current, refreshed session token.
  auth: callback => {
    void getSupabaseAccessToken().then(token => callback({ token }));
  },
};

export function IdentityProviderChatDemo() {
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
