export const PAGE_PADDING_CLASS = 'p-4 sm:p-6 md:px-8 md:py-8';

// Pages are border-box, so a full-height page keeps its padding inside
// --page-h. A board nested in a padded page subtracts the vertical padding of
// PAGE_PADDING_CLASS at each breakpoint; keep both in sync.
export const FULL_HEIGHT_PAGE_CLASS = 'h-[var(--page-h)]';
export const PAGE_BODY_HEIGHT_CLASS =
  'h-[calc(var(--page-h)_-_2rem)] sm:h-[calc(var(--page-h)_-_3rem)] md:h-[calc(var(--page-h)_-_4rem)]';
