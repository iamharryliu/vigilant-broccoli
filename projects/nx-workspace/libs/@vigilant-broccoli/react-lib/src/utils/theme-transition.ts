const ATTRIBUTE = 'data-theme-transition';
const STYLE_ID = 'vb-theme-transition';
const DURATION_MS = 300;
const EASING = 'ease';
const PROPERTIES = ['background-color', 'color', 'border-color'];

// `:where()` keeps specificity at zero so Tailwind `transition-*` utilities and
// app rules keep their own timing; the attribute is only present briefly after
// a manual toggle, so first paint, hover states and canvas/game animations are
// never slowed by it.
const CSS = `@media (prefers-reduced-motion: no-preference) {
  :where([${ATTRIBUTE}], [${ATTRIBUTE}] *, [${ATTRIBUTE}] *::before, [${ATTRIBUTE}] *::after) {
    transition: ${PROPERTIES.map(
      property => `${property} ${DURATION_MS / 1000}s ${EASING}`,
    ).join(', ')};
  }
}`;

let timer: ReturnType<typeof setTimeout> | undefined;

/**
 * Animates the next appearance change across the whole document. Call it just
 * before applying a user-initiated toggle; the stylesheet is injected on first
 * use so every consumer of `useThemePreference` shares one duration/easing.
 */
export const startThemeTransition = () => {
  if (typeof document === 'undefined') return;
  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = CSS;
    document.head.appendChild(style);
  }
  const root = document.documentElement;
  root.setAttribute(ATTRIBUTE, '');
  clearTimeout(timer);
  timer = setTimeout(() => root.removeAttribute(ATTRIBUTE), DURATION_MS + 50);
};
