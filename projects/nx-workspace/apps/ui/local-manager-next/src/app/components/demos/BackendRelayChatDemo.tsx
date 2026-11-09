'use client';

import { HTTP_METHOD } from '@vigilant-broccoli/common-js';
import { API_ENDPOINTS } from '../../constants/api-endpoints';
import { ChatPayload } from '../../constants/chat';
import { useChatRoom } from '../../hooks/useChatRoom';
import { authFetch } from '../../../../libs/auth';
import { ChatDemoPanel } from './ChatDemoPanel';

const DESCRIPTION =
  'Receives over an unauthenticated socket. Sends through a backend route that holds the publisher credential, so sending requires sign-in.';
const SOCKET_OPTIONS = { reconnection: true };
const ERR_PUBLISH_FAILED = 'Publish failed';

const publishThroughBackend = async ({ text, sender }: ChatPayload) => {
  const res = await authFetch(API_ENDPOINTS.CHAT_PUBLISH, {
    method: HTTP_METHOD.POST,
    body: JSON.stringify({ text, sender }),
  });
  if (!res.ok) throw new Error(ERR_PUBLISH_FAILED);
};

export function BackendRelayChatDemo() {
  const { status, messages } = useChatRoom(SOCKET_OPTIONS);
  return (
    <ChatDemoPanel
      description={DESCRIPTION}
      status={status}
      messages={messages}
      onSend={publishThroughBackend}
    />
  );
}
