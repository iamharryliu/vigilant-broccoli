import * as Y from 'yjs';

export const YJS_TEXT_NAME = 'content';

const FNV_OFFSET_BASIS = 0x811c9dc5;
const FNV_PRIME = 0x01000193;

export const encodeUpdate = (update: Uint8Array): string => {
  let binary = '';
  update.forEach(byte => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
};

export const decodeUpdate = (encoded: string): Uint8Array => {
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

const hashText = (text: string): number => {
  let hash = FNV_OFFSET_BASIS;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, FNV_PRIME);
  }
  return hash >>> 0;
};

// Builds the Yjs state for a row saved before Yjs state was persisted. The
// insert's client id is derived from the text, so every client seeding the
// same text produces byte-identical items and Yjs merges them as one instead
// of doubling the text; different texts get different ids, which keeps Yjs's
// unique-item-id invariant.
export const createTextSeedState = (text: string): string => {
  const doc = new Y.Doc();
  doc.clientID = hashText(text);
  doc.getText(YJS_TEXT_NAME).insert(0, text);
  const state = encodeUpdate(Y.encodeStateAsUpdate(doc));
  doc.destroy();
  return state;
};
