import { type QuickLink } from '@vigilant-broccoli/common-js';
import { EMBED_ROUTE_PATH, EMBED_TARGET_PARAM } from '../app.const';

const MOBILE_VIEWPORT_QUERY = '(max-width: 767px)';
const FINE_POINTER_QUERY = '(pointer: fine)';

export const isDesktopEmbedEnvironment = (): boolean =>
  typeof window !== 'undefined' &&
  !window.matchMedia(MOBILE_VIEWPORT_QUERY).matches &&
  window.matchMedia(FINE_POINTER_QUERY).matches;

export const toEmbedRoute = (link: QuickLink): string =>
  `${EMBED_ROUTE_PATH}?${new URLSearchParams({ [EMBED_TARGET_PARAM]: link.target })}`;
