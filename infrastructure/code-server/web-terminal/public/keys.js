export const ESC = '\x1b';
export const CR = '\r';

// Cursor-style keys differ by DECCKM: SS3 in application mode (vim, less),
// CSI otherwise.
const CURSOR_KEYS = {
  up: 'A',
  down: 'B',
  right: 'C',
  left: 'D',
};
const TILDE_KEYS = { pageUp: '5', pageDown: '6' };

export const KEY = {
  ENTER: 'enter',
  ESC: 'esc',
  TAB: 'tab',
  ...Object.fromEntries(
    [...Object.keys(CURSOR_KEYS), ...Object.keys(TILDE_KEYS)].map(key => [
      key.replace(/[A-Z]/g, c => `_${c}`).toUpperCase(),
      key,
    ]),
  ),
};

export const encodeKey = (key, { appCursor = false } = {}) => {
  if (key === KEY.ENTER) return CR;
  if (key === KEY.ESC) return ESC;
  if (key === KEY.TAB) return '\t';
  if (key in CURSOR_KEYS) {
    const final = CURSOR_KEYS[key];
    return appCursor ? `${ESC}O${final}` : `${ESC}[${final}`;
  }
  if (key in TILDE_KEYS) return `${ESC}[${TILDE_KEYS[key]}~`;
  return '';
};

export const CTRL_SHORTCUT = {
  C: '\x03',
};
