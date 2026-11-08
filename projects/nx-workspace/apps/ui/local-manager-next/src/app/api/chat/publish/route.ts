import {
  HTTP_HEADERS,
  HTTP_METHOD,
  PublishAck,
  SOCKET_SERVER_PATHS,
} from '@vigilant-broccoli/common-js';
import {
  CHAT_APP,
  CHAT_PUBLISH_TIMEOUT_MS,
  CHAT_ROOM,
  ChatPayload,
} from '../../../constants/chat';
import { createChatPublishHandler } from './create-chat-publish-handler';

const LOG_PREFIX = '[chat/publish]';

const publishOverHttp = async (
  url: string,
  token: string,
  payload: ChatPayload,
): Promise<PublishAck | null> => {
  const res = await fetch(`${url}${SOCKET_SERVER_PATHS.PUBLISH}`, {
    method: HTTP_METHOD.POST,
    headers: {
      ...HTTP_HEADERS.CONTENT_TYPE.JSON,
      ...HTTP_HEADERS.AUTHORIZATION(token),
    },
    body: JSON.stringify({ app: CHAT_APP, receiverId: CHAT_ROOM, payload }),
    signal: AbortSignal.timeout(CHAT_PUBLISH_TIMEOUT_MS),
  });
  return res.json().catch(() => null);
};

export const POST = createChatPublishHandler(LOG_PREFIX, publishOverHttp);
