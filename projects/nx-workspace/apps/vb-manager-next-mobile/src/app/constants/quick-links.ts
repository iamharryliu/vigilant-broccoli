import { OPEN_TYPE, type QuickLink } from '@vigilant-broccoli/common-js';
import { EXTERNAL_QUICK_LINKS } from '@vigilant-broccoli/links';

export const QUICK_LINKS: QuickLink[] = EXTERNAL_QUICK_LINKS.filter(
  link => link.type === OPEN_TYPE.BROWSER,
);
