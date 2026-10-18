import { OPEN_TYPE, type QuickLink } from '@vigilant-broccoli/common-js';
import {
  EXTERNAL_QUICK_LINKS,
  LINK_GROUP_SUBGROUP,
} from '@vigilant-broccoli/links';

// The home Agentic tab renders these from the README table, so Quick Links
// leaves them out.
export const QUICK_LINKS: QuickLink[] = EXTERNAL_QUICK_LINKS.filter(
  link =>
    link.type === OPEN_TYPE.BROWSER &&
    link.subgroup !== LINK_GROUP_SUBGROUP.AGENTIC,
);
