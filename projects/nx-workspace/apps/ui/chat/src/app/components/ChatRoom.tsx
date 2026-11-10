'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { HTTP_HEADERS, HTTP_METHOD } from '@vigilant-broccoli/common-js';
import {
  ChatPanel,
  ChatPayload,
  useChatRoom,
} from '@vigilant-broccoli/react-lib-higher-level';
import { API_ROUTE, CHAT_APP, CHAT_ROOM } from '../app.const';
import { useTranslation } from '../i18n';

const SOCKET_OPTIONS = { reconnection: true };
const ERR_PUBLISH_FAILED = 'Publish failed';
const LIST_CLASS = 'h-[60vh]';

const publish = async ({ text, sender }: ChatPayload) => {
  const res = await fetch(API_ROUTE.PUBLISH, {
    method: HTTP_METHOD.POST,
    headers: HTTP_HEADERS.CONTENT_TYPE.JSON,
    body: JSON.stringify({ text, sender }),
  });
  if (!res.ok) throw new Error(ERR_PUBLISH_FAILED);
};

const useSocket = (url: string | undefined) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  useEffect(() => {
    if (!url) return;
    const s = io(url, SOCKET_OPTIONS);
    setSocket(s);
    return () => {
      s.close();
      setSocket(null);
    };
  }, [url]);
  return socket;
};

export function ChatRoom() {
  const { t } = useTranslation();
  const url = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL;
  const socket = useSocket(url);
  const { status, messages } = useChatRoom({
    socket,
    app: CHAT_APP,
    room: CHAT_ROOM,
    configured: Boolean(url),
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-4 bg-background p-4 text-foreground">
      <h1 className="text-2xl font-semibold">{t('HOME.TITLE')}</h1>
      <ChatPanel
        description={t('HOME.DESCRIPTION')}
        status={status}
        messages={messages}
        onSend={publish}
        listClassName={LIST_CLASS}
      />
    </main>
  );
}
