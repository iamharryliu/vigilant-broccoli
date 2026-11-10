'use client';

import {
  CHAT_DEMO_APP,
  CHAT_DEMO_ROOM,
  useChatRoom,
} from '@vigilant-broccoli/react-lib-higher-level';
import { useSocketWithCertTrustPrompt } from './useSocketWithCertTrustPrompt';

export function useDemoChatRoom(
  options: Parameters<typeof useSocketWithCertTrustPrompt>[1],
) {
  const url = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL;
  const socket = useSocketWithCertTrustPrompt(url, options);
  const { status, messages } = useChatRoom({
    socket,
    app: CHAT_DEMO_APP,
    room: CHAT_DEMO_ROOM,
    configured: Boolean(url),
  });
  return { socket, status, messages };
}
