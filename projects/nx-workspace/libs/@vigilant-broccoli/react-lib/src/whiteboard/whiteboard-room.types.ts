import { ConnectionStatus } from '../live-location/live-location.types';

export interface WhiteboardMember {
  userId: string;
  username: string;
}

export interface WhiteboardRoomState {
  content: string;
  setContent: (content: string) => void;
  members: WhiteboardMember[];
  connectionStatus: ConnectionStatus;
}
