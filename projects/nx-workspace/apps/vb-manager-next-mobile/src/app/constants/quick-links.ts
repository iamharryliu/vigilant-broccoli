import { OPEN_TYPE, type QuickLink } from '@vigilant-broccoli/common-js';
import { PERSONAL_QUICK_LINKS } from '@vigilant-broccoli/personal-common-js';

export const QUICK_LINKS: QuickLink[] = PERSONAL_QUICK_LINKS.filter(
  link => link.type === OPEN_TYPE.BROWSER,
);
