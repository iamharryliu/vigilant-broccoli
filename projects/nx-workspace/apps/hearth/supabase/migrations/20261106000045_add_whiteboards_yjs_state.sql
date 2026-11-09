-- Base64 Y.encodeStateAsUpdate of the board, saved with content so every
-- client loads the same Yjs history and merges instead of re-inserting text.
-- content stays the canonical text (history, export, AI assistant); null
-- means the row was written without state and clients seed from content.
alter table whiteboards
  add column yjs_state text;
