// Wire format shared by useNotepad and the notepad routes (via
// `@vigilant-broccoli/react-lib-higher-level/notepad-server`).
export interface NotepadDocument {
  content: string;
  // Base64 `Y.encodeStateAsUpdate` matching `content`; null for rows saved
  // before Yjs state was persisted or last written by a client without it.
  yjsState: string | null;
  updatedAt: string | null;
}

export interface NotepadSaveRequest {
  content: string;
  yjsState?: string | null;
  baseUpdatedAt: string | null;
  allowEmpty?: boolean;
}
