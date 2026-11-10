'use client';

import { HTTP_METHOD } from '@vigilant-broccoli/common-js';
import {
  ChatPanel,
  ChatPayload,
} from '@vigilant-broccoli/react-lib-higher-level';
import { API_ENDPOINTS } from '../../constants/api-endpoints';
import { useDemoChatRoom } from '../../hooks/useDemoChatRoom';
import { authFetch } from '../../../../libs/auth';

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
  const { status, messages } = useDemoChatRoom(SOCKET_OPTIONS);
  return (
    <ChatPanel
      description={DESCRIPTION}
      status={status}
      messages={messages}
      onSend={publishThroughBackend}
    />
  );
}
