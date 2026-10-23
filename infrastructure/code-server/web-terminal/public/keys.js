export const ESC = '\x1b';

// Cursor-style keys differ by DECCKM: SS3 in application mode (vim, less),
// CSI otherwise.
const CURSOR_KEYS = {
  up: 'A',
  down: 'B',
  right: 'C',
  left: 'D',
  home: 'H',
  end: 'F',
};
const TILDE_KEYS = { pageUp: '5', pageDown: '6' };

export const KEY = {
  ESC: 'esc',
  TAB: 'tab',
  ...Object.fromEntries(
    [...Object.keys(CURSOR_KEYS), ...Object.keys(TILDE_KEYS)].map(key => [
      key.replace(/[A-Z]/g, c => `_${c}`).toUpperCase(),
      key,
    ]),
  ),
};

// xterm modifier parameter: 1 + shift(1) + alt(2) + ctrl(4).
const modifierParam = ({ ctrl, alt }) => 1 + (alt ? 2 : 0) + (ctrl ? 4 : 0);

export const encodeKey = (
  key,
  { appCursor = false, ctrl = false, alt = false } = {},
) => {
  const mod = modifierParam({ ctrl, alt });
  if (key === KEY.ESC) return alt ? ESC + ESC : ESC;
  if (key === KEY.TAB) return alt ? `${ESC}\t` : '\t';
  if (key in CURSOR_KEYS) {
    const final = CURSOR_KEYS[key];
    if (mod > 1) return `${ESC}[1;${mod}${final}`;
    return appCursor ? `${ESC}O${final}` : `${ESC}[${final}`;
  }
  if (key in TILDE_KEYS) {
    return mod > 1
      ? `${ESC}[${TILDE_KEYS[key]};${mod}~`
      : `${ESC}[${TILDE_KEYS[key]}~`;
  }
  return '';
};

// Ctrl+<char> maps to the C0 control code: @ A-Z [ \ ] ^ _ -> 0x00-0x1f.
export const applyCtrl = char => {
  if (char.length !== 1) return char;
  if (char === '?') return '\x7f';
  if (char === ' ') return '\x00';
  const code = char.toUpperCase().charCodeAt(0);
  return code >= 0x40 && code <= 0x5f ? String.fromCharCode(code - 0x40) : char;
};

// Applies the sticky Ctrl/Alt toggles to text typed on the soft keyboard.
export const applyModifiers = (data, { ctrl = false, alt = false } = {}) => {
  if (data.length !== 1) return data;
  const mapped = ctrl ? applyCtrl(data) : data;
  return alt ? ESC + mapped : mapped;
};

export const CTRL_SHORTCUT = {
  C: applyCtrl('c'),
  D: applyCtrl('d'),
  Z: applyCtrl('z'),
};
