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

const insertNewlineInTextarea = (textarea: HTMLTextAreaElement) => {
  // execCommand fires the same beforeinput/input events as typing, which
  // React and SyncedTextEditor observe, and keeps the native undo stack.
  if (document.execCommand('insertText', false, '\n')) return;
  const { selectionStart, selectionEnd, value } = textarea;
  const setValue = Object.getOwnPropertyDescriptor(
    HTMLTextAreaElement.prototype,
    'value',
  )?.set;
  setValue?.call(
    textarea,
    `${value.slice(0, selectionStart)}\n${value.slice(selectionEnd)}`,
  );
  textarea.setSelectionRange(selectionStart + 1, selectionStart + 1);
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
};

const submitFromInput = (input: HTMLInputElement) => {
  const keyInit = { key: 'Enter', code: 'Enter', bubbles: true };
  const keydown = new KeyboardEvent('keydown', {
    ...keyInit,
    cancelable: true,
  });
  if (!input.dispatchEvent(keydown)) return;
  input.form?.requestSubmit();
  input.dispatchEvent(new KeyboardEvent('keyup', keyInit));
};

export const pressEnter = (element: HTMLElement) => {
  if (element instanceof HTMLInputElement) return submitFromInput(element);
  if (element instanceof HTMLTextAreaElement)
    return insertNewlineInTextarea(element);
  document.execCommand('insertParagraph');
};
