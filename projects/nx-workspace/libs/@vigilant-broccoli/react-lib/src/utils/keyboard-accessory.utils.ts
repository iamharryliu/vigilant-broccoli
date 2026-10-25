const TEXT_INPUT_TYPES = new Set([
  'text',
  'search',
  'email',
  'url',
  'tel',
  'password',
  'number',
]);

export const isTextEntryElement = (
  element: Element | null,
): element is HTMLElement => {
  if (!(element instanceof HTMLElement)) return false;
  if (element instanceof HTMLTextAreaElement) return !element.readOnly;
  if (element instanceof HTMLInputElement)
    return TEXT_INPUT_TYPES.has(element.type) && !element.readOnly;
  return element.isContentEditable;
};

// Submits rather than inserting a newline, even in textareas: fields with
// their own Enter handler (e.g. GoogleTasks) prevent the keydown and submit
// themselves; otherwise the enclosing form is submitted. The keyboard's own
// return key still inserts newlines.
export const pressEnter = (element: HTMLElement) => {
  const keyInit = { key: 'Enter', code: 'Enter', bubbles: true };
  const keydown = new KeyboardEvent('keydown', {
    ...keyInit,
    cancelable: true,
  });
  if (element.dispatchEvent(keydown)) element.closest('form')?.requestSubmit();
  element.dispatchEvent(new KeyboardEvent('keyup', keyInit));
};

const HISTORY_KEY = 'z';

// Editors with their own history (SyncedTextEditor's onUndo/onRedo) handle
// the ⌘Z/⌘⇧Z keydown; a synthetic keydown never triggers the browser's own
// undo, so unhandled fields fall back to the native stack via execCommand.
const pressHistoryKey = (element: HTMLElement, redo: boolean) => {
  const keydown = new KeyboardEvent('keydown', {
    key: HISTORY_KEY,
    code: 'KeyZ',
    metaKey: true,
    shiftKey: redo,
    bubbles: true,
    cancelable: true,
  });
  if (element.dispatchEvent(keydown))
    document.execCommand(redo ? 'redo' : 'undo');
};

export const pressUndo = (element: HTMLElement) =>
  pressHistoryKey(element, false);

export const pressRedo = (element: HTMLElement) =>
  pressHistoryKey(element, true);
