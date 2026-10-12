export const PREFERS_DARK_QUERY = '(prefers-color-scheme: dark)';
const RGB_LUMINANCE = { R: 0.2126, G: 0.7152, B: 0.0722, MID: 128 } as const;

const parseRgb = (
  value: string,
): { r: number; g: number; b: number; a: number } | null => {
  const match = value.match(/rgba?\(([^)]+)\)/);
  if (!match) return null;
  const [r, g, b, a = 1] = match[1].split(',').map(part => parseFloat(part));
  if ([r, g, b].some(Number.isNaN)) return null;
  return { r, g, b, a };
};

// Detect the actual background painted behind the canvas rather than guessing
// the theme: the app may render light even while the OS prefers dark, so a
// prefers-color-scheme guess can pick line colors that vanish into the page.
export const isDarkTheme = (el: HTMLElement | null): boolean => {
  if (typeof document === 'undefined') return false;
  for (let node = el; node; node = node.parentElement) {
    const rgb = parseRgb(getComputedStyle(node).backgroundColor);
    if (rgb && rgb.a > 0) {
      const luminance =
        RGB_LUMINANCE.R * rgb.r +
        RGB_LUMINANCE.G * rgb.g +
        RGB_LUMINANCE.B * rgb.b;
      return luminance < RGB_LUMINANCE.MID;
    }
  }
  return window.matchMedia?.(PREFERS_DARK_QUERY).matches ?? false;
};
