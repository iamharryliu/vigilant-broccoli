'use client';

import { useState } from 'react';
import { API_ENDPOINTS } from '../../constants/api-endpoints';
import { CHAT_APP, CHAT_ROOM, ChatPayload } from '../../constants/chat';
import { useEventStream } from '../../hooks/useEventStream';
import { ChatDemoPanel } from './ChatDemoPanel';

export function SSEChatDemo() {
  const [messages, setMessages] = useState<ChatPayload[]>([]);
  const status = useEventStream<ChatPayload>(
    process.env.NEXT_PUBLIC_SOCKET_SERVER_URL,
    CHAT_APP,
    CHAT_ROOM,
    ({ payload }) => setMessages(prev => [...prev, payload]),
  );

  return (
    <ChatDemoPanel
      status={status}
      messages={messages}
      publishEndpoint={API_ENDPOINTS.CHAT_PUBLISH}
    />
  );
}
