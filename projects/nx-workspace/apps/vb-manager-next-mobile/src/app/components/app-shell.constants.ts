export const PAGE_MIN_HEIGHT =
  'min-h-[calc(100dvh-var(--topbar-h))] md:min-h-screen';
export const PAGE_HEIGHT = 'h-[calc(100dvh-var(--topbar-h))] md:h-screen';
// Phone view grows with its content so the document scrolls; desktop stays
// pinned to the viewport so the embedded calendar iframe can fill it.
export const PAGE_HEIGHT_MOBILE_SCROLL = `${PAGE_MIN_HEIGHT} md:h-screen`;
