import { OPEN_TYPE, type QuickLink } from '@vigilant-broccoli/common-js';
import {
  EXTERNAL_QUICK_LINKS,
  LINK_GROUP_SUBGROUP,
} from '@vigilant-broccoli/links';

const BROWSER_QUICK_LINKS = EXTERNAL_QUICK_LINKS.filter(
  link => link.type === OPEN_TYPE.BROWSER,
);

const isAgenticLink = (link: QuickLink) =>
  link.subgroup === LINK_GROUP_SUBGROUP.AGENTIC;

// The Agentic tab owns these, so Quick Links leaves them out.
export const QUICK_LINKS: QuickLink[] = BROWSER_QUICK_LINKS.filter(
  link => !isAgenticLink(link),
);

export const AGENTIC_LINKS: QuickLink[] =
  BROWSER_QUICK_LINKS.filter(isAgenticLink);
