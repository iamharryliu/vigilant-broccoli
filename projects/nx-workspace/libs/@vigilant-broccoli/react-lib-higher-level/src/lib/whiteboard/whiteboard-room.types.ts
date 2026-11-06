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
  index: number | null;
  updatedAt: number;
}

export interface WhiteboardRoomState {
  content: string;
  setContent: (content: string) => void;
  // Applies a server snapshot without adding it to this client's undo stack.
  replaceContent: (content: string) => void;
  // Merges a base64 Yjs state (persisted or a peer's) without adding it to
  // this client's undo stack; applying the same state twice is a no-op.
  applyState: (state: string) => void;
  // Base64 Yjs state of the whole document, or null before the doc exists.
  encodeState: () => string | null;
  // The doc's text right now, which can be ahead of `content` until the next
  // render.
  getContent: () => string;
  // Increments each time the Y.Doc is rebuilt (channel, user or privacy
  // change); a new generation starts empty and must be loaded again.
  docGeneration: number;
  // Whether the latest text change was an edit (this client's typing or
  // undo/redo, or a peer's update) rather than a replaced snapshot or a
  // rebuilt, empty room.
  lastChangeIsEdit: boolean;
  members: WhiteboardMember[];
  cursors: WhiteboardCursor[];
  setCursorPosition: (x: number | null, y: number | null) => void;
  setTextCursorIndex: (index: number | null) => void;
  connectionStatus: ConnectionStatus;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}
