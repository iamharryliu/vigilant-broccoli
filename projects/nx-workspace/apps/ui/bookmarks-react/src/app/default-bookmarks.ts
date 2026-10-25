import { OPEN_TYPE, type QuickLink } from '@vigilant-broccoli/common-js';
import { PUBLIC_QUICK_LINKS } from '@vigilant-broccoli/public-links';

// Bookmarks accept only plain browser links, so embed flags are dropped.
export const DEFAULT_BOOKMARKS: QuickLink[] = PUBLIC_QUICK_LINKS.filter(
  link => link.type === OPEN_TYPE.BROWSER && !link.args,
).map(({ label, target, type, subgroup }) => ({
  label,
  target,
  type,
  ...(subgroup ? { subgroup } : {}),
}));
