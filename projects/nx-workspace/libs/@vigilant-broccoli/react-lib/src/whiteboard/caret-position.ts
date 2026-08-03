const MIRROR_OFFSCREEN_LEFT = '-9999px';
const FALLBACK_CHARACTER = '.';

export interface CaretCoordinates {
  top: number;
  left: number;
  height: number;
}

// Measures where a character index would render inside a <textarea> by
// laying the same text out in a hidden mirror div with matching font
// metrics, then reading the offset of a marker span placed at that index.
export function getCaretCoordinates(
  textarea: HTMLTextAreaElement,
  index: number,
): CaretCoordinates {
  const style = window.getComputedStyle(textarea);
  const paddingLeft = parseFloat(style.paddingLeft);
  const paddingTop = parseFloat(style.paddingTop);
  const borderLeft = parseFloat(style.borderLeftWidth);
  const borderTop = parseFloat(style.borderTopWidth);
  const contentWidth =
    textarea.clientWidth - paddingLeft - parseFloat(style.paddingRight);

  const mirror = document.createElement('div');
  mirror.style.position = 'absolute';
  mirror.style.visibility = 'hidden';
  mirror.style.top = '0';
  mirror.style.left = MIRROR_OFFSCREEN_LEFT;
  mirror.style.width = `${contentWidth}px`;
  mirror.style.whiteSpace = 'pre-wrap';
  mirror.style.wordWrap = 'break-word';
  mirror.style.wordBreak = style.wordBreak;
  mirror.style.fontFamily = style.fontFamily;
  mirror.style.fontSize = style.fontSize;
  mirror.style.fontWeight = style.fontWeight;
  mirror.style.fontStyle = style.fontStyle;
  mirror.style.lineHeight = style.lineHeight;
  mirror.style.letterSpacing = style.letterSpacing;
  mirror.style.tabSize = style.tabSize;

  const value = textarea.value;
  mirror.textContent = value.substring(0, index);

  const marker = document.createElement('span');
  const nextChar = value.charAt(index);
  marker.textContent =
    nextChar && nextChar !== '\n' ? nextChar : FALLBACK_CHARACTER;
  mirror.appendChild(marker);

  document.body.appendChild(mirror);
  const coordinates: CaretCoordinates = {
    top: marker.offsetTop + paddingTop + borderTop,
    left: marker.offsetLeft + paddingLeft + borderLeft,
    height: marker.offsetHeight,
  };
  document.body.removeChild(mirror);

  return coordinates;
}
