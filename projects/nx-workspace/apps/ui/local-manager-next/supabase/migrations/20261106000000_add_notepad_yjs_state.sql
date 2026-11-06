-- Base64 Y.encodeStateAsUpdate of the notepad, saved with content so every
-- client loads the same Yjs history and merges instead of re-inserting text.
-- content stays the canonical text; null means the row was written without
-- state and clients seed from content.
alter table notepad
  add column yjs_state text;
