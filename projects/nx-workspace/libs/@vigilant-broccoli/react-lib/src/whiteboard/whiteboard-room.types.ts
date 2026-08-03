import { ConnectionStatus } from '../live-location/live-location.types';

export interface WhiteboardMember {
  userId: string;
  username: string;
}

export interface WhiteboardCursor {
  userId: string;
  username: string;
  x: number | null;
  y: number | null;
  updatedAt: number;
}

export interface WhiteboardRoomState {
  content: string;
  setContent: (content: string) => void;
  members: WhiteboardMember[];
  cursors: WhiteboardCursor[];
  setCursorPosition: (x: number | null, y: number | null) => void;
  connectionStatus: ConnectionStatus;
}
