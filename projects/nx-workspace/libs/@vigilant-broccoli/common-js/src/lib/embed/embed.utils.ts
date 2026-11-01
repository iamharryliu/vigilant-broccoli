export const EMBED_ROUTE_PATH = '/embed';
export const EMBED_TARGET_PARAM = 'target';

export const toEmbedRoute = (link: { target: string }): string =>
  `${EMBED_ROUTE_PATH}?${new URLSearchParams({ [EMBED_TARGET_PARAM]: link.target })}`;
