'use client';

import {
  SupabaseBroadcastLike,
  WhiteboardRoomState,
  useWhiteboardRoom as useSharedWhiteboardRoom,
} from '@vigilant-broccoli/react-lib';
import { supabase } from '../../lib/supabase';

const CHANNEL_PREFIX = 'whiteboard-room:';

export { CONNECTION_STATUS } from '@vigilant-broccoli/react-lib';
export type {
  ConnectionStatus,
  WhiteboardMember,
  WhiteboardRoomState,
} from '@vigilant-broccoli/react-lib';

export function useWhiteboardRoom(
  roomId: string,
  userId: string,
  username: string,
): WhiteboardRoomState {
  return useSharedWhiteboardRoom(
    supabase as unknown as SupabaseBroadcastLike,
    `${CHANNEL_PREFIX}${roomId}`,
    userId,
    username,
  );
}
