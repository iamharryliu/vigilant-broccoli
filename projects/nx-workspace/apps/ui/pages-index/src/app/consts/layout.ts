// Every page shares one container width and gutter so the content column does
// not shift when navigating between pages. Only the Claude Context viewer opts
// out, via WIDE_PAGE_CLASS, because its file tree sits beside the content.
const PAGE_WIDTH_CLASS = 'mx-auto max-w-3xl';
const WIDE_PAGE_WIDTH_CLASS = 'mx-auto max-w-6xl';
const PAGE_GUTTER_CLASS = 'px-4 sm:px-6';

// Scrolling pages: room at the bottom so the last card clears the viewport edge.
export const PAGE_CLASS = `${PAGE_WIDTH_CLASS} ${PAGE_GUTTER_CLASS} pt-6 pb-16`;

// Pages that own the viewport and scroll internally (timeline, docs viewer).
const VIEWPORT_PAGE_CLASS = `flex h-[100dvh] flex-col overflow-hidden ${PAGE_GUTTER_CLASS} pt-6 pb-4`;

export const FULL_HEIGHT_PAGE_CLASS = `${PAGE_WIDTH_CLASS} ${VIEWPORT_PAGE_CLASS}`;

export const WIDE_FULL_HEIGHT_PAGE_CLASS = `${WIDE_PAGE_WIDTH_CLASS} ${VIEWPORT_PAGE_CLASS}`;
