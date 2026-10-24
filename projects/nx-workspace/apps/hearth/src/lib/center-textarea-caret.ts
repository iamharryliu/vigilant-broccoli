// Textareas expose no caret coordinates, so the caret's offset is measured on
// an off-screen mirror that wraps text exactly like the textarea.
const MIRROR_PROPERTIES = [
  'boxSizing',
  'width',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
  'borderStyle',
  'fontFamily',
  'fontSize',
  'fontWeight',
  'fontStyle',
  'letterSpacing',
  'lineHeight',
  'textTransform',
  'wordSpacing',
  'tabSize',
  'textIndent',
] as const;
const CARET_MARKER = '​';

const getCaretOffsetTop = (textarea: HTMLTextAreaElement) => {
  const computed = window.getComputedStyle(textarea);
  const mirror = document.createElement('div');
  MIRROR_PROPERTIES.forEach(property => {
    mirror.style[property] = computed[property];
  });
  Object.assign(mirror.style, {
    position: 'absolute',
    visibility: 'hidden',
    top: '0',
    left: '-9999px',
    height: 'auto',
    overflow: 'hidden',
    whiteSpace: 'pre-wrap',
    overflowWrap: 'break-word',
  });
  mirror.textContent = textarea.value.slice(0, textarea.selectionStart);
  const marker = document.createElement('span');
  marker.textContent = CARET_MARKER;
  mirror.appendChild(marker);
  document.body.appendChild(mirror);
  const caretTop = marker.offsetTop + marker.offsetHeight / 2;
  mirror.remove();
  return caretTop;
};

export const centerTextareaCaret = (textarea: HTMLTextAreaElement) => {
  textarea.scrollTop = Math.max(
    0,
    getCaretOffsetTop(textarea) - textarea.clientHeight / 2,
  );
};
