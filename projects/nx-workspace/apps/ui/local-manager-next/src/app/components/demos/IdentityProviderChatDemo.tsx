'use client';

import {
  ChatPanel,
  ChatPayload,
} from '@vigilant-broccoli/react-lib-higher-level';
import { useDemoChatRoom } from '../../hooks/useDemoChatRoom';
import { getSupabaseAccessToken } from '../../../../libs/auth';
import { publishOverSocket } from './chat-socket-publish';

const DESCRIPTION =
  'Connects with your Supabase JWT, which the socket server verifies, then sends over the socket. Sending requires sign-in.';

const SOCKET_OPTIONS: Parameters<typeof useDemoChatRoom>[0] = {
  reconnection: true,
  // A function so every reconnect sends the current, refreshed session token.
  auth: callback => {
    void getSupabaseAccessToken().then(token => callback({ token }));
  },
};

export function IdentityProviderChatDemo() {
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
