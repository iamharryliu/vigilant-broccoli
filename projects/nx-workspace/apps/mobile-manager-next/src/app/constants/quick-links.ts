import { OPEN_TYPE, type QuickLink } from '@vigilant-broccoli/common-js';
import { EXTERNAL_QUICK_LINKS } from '@vigilant-broccoli/manager';

const HTTPS_PROTOCOL = 'https:';
const LOCAL_HOST_PATTERN =
  /^(localhost|\[.*\]|\d{1,3}(\.\d{1,3}){3}|[^.]+|.+\.(local|lan|internal|home\.arpa))$/;

const normalizeUrl = (url: string) => new URL(url).href;

// Local-only pages (localhost, LAN, bare or IP hosts) are unreachable from a
// phone and must never be framed, even if the registry flags them.
const isPublicHttpsUrl = (url: string) => {
  try {
    const { protocol, hostname } = new URL(url);
    return protocol === HTTPS_PROTOCOL && !LOCAL_HOST_PATTERN.test(hostname);
  } catch {
    return false;
  }
};

const isEmbeddable = (link: QuickLink) =>
  link.embed === true && isPublicHttpsUrl(link.target);

export const QUICK_LINKS: QuickLink[] = EXTERNAL_QUICK_LINKS.filter(
  link => link.type === OPEN_TYPE.BROWSER,
).map(link =>
  link.embed && !isEmbeddable(link) ? { ...link, embed: false } : link,
);

const EMBED_LINKS = QUICK_LINKS.filter(isEmbeddable);

export const findEmbedLink = (target: string | null | undefined) => {
  if (!target) return undefined;
  try {
    const href = normalizeUrl(target);
    return EMBED_LINKS.find(link => normalizeUrl(link.target) === href);
  } catch {
    return undefined;
  }
};
