const TEXT_ENTRY_TAGS = ['INPUT', 'TEXTAREA', 'SELECT'];
const TEXT_ENTRY_ROLES = ['textbox', 'combobox', 'searchbox'];
const TEXT_ENTRY_SELECTOR = TEXT_ENTRY_ROLES.map(
  role => `[role="${role}"]`,
).join(',');
const OPEN_DIALOG_SELECTOR =
  '[role="dialog"], [role="alertdialog"], [aria-modal="true"], dialog[open]';

const isTextEntryElement = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement &&
  (TEXT_ENTRY_TAGS.includes(target.tagName) ||
    target.isContentEditable ||
    target.closest(TEXT_ENTRY_SELECTOR) !== null);

const isDialogOpen = (): boolean =>
  document.querySelector(OPEN_DIALOG_SELECTOR) !== null;

// `defaultPrevented` lets React handlers (dispatched from the root container,
// before a window listener) claim a key for themselves. `isComposing` covers
// IME input, whose keydowns carry the raw key rather than the composed text.
export const shouldIgnoreShortcutKeystroke = (e: KeyboardEvent): boolean =>
  e.defaultPrevented ||
  e.isComposing ||
  e.ctrlKey ||
  e.metaKey ||
  e.altKey ||
  isTextEntryElement(e.target) ||
  isTextEntryElement(document.activeElement) ||
  isDialogOpen();
