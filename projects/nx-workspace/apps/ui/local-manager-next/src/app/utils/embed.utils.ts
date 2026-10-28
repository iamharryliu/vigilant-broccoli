const MOBILE_VIEWPORT_QUERY = '(max-width: 767px)';
const FINE_POINTER_QUERY = '(pointer: fine)';

export const isDesktopEmbedEnvironment = (): boolean =>
  typeof window !== 'undefined' &&
  !window.matchMedia(MOBILE_VIEWPORT_QUERY).matches &&
  window.matchMedia(FINE_POINTER_QUERY).matches;
