import { JOB_APPLICATION_BOOKMARKLET } from '@vigilant-broccoli/common-js';
import { ROOT_PATH } from '../app.const';

// Cleanup happens in `extractJobPosting`, so send the whole page, not a slice.
const BOOKMARKLET_TEXT_LIMIT = 300000;
const BOOKMARKLET_EXPAND_WAIT_MS = 600;
// Only collapsed "… more" / "Show more" / "See more" toggles; other expanders
// (menus, filters) are left alone.
const BOOKMARKLET_EXPANDER_PATTERN = /(…|\.\.\.)\s*more|(show|see)\s+more/i;
const BOOKMARKLET_RETRY_MS = 300;
const BOOKMARKLET_GIVE_UP_MS = 15000;

const UNSAFE_JS_CHAR_MAP: Record<string, string> = {
  '<': '\\u003C',
  '>': '\\u003E',
  '/': '\\u002F',
  '\b': '\\b',
  '\f': '\\f',
  '\n': '\\n',
  '\r': '\\r',
  '\t': '\\t',
  '\0': '\\0',
  '\u2028': '\\u2028',
  '\u2029': '\\u2029',
};

const escapeUnsafeJsChars = (value: string) =>
  value.replace(
    /[<>\u002F\b\f\n\r\t\0\u2028\u2029]/g,
    char => UNSAFE_JS_CHAR_MAP[char],
  );

const BOOKMARKLET_TARGET_KEY = 'job-applications-bookmarklet-target';

const framingOrigin = () => {
  const ancestor = window.location.ancestorOrigins?.[0];
  if (ancestor) return ancestor;
  try {
    return new URL(document.referrer).origin;
  } catch {
    return '';
  }
};

const isUrlOnOrigin = (url: string, origin: string) => {
  try {
    return new URL(url).origin === origin;
  } catch {
    return false;
  }
};

// An embedding page (vb-manager-next's Job Hunt) passes its own URL in
// `?bookmarklet=` so the bookmarklet opens it and the page relays the posting
// into this frame. It is honoured only while framed by that same origin, so a
// crafted link opened directly cannot point the bookmarklet at another site.
// Links inside the app drop the param, so the accepted URL is kept for the
// tab; call this once on load.
export const readBookmarkletTarget = () => {
  const own = `${window.location.origin}${ROOT_PATH}`;
  if (window.parent === window) return own;
  const requested = new URLSearchParams(window.location.search).get(
    JOB_APPLICATION_BOOKMARKLET.TARGET_PARAM,
  );
  try {
    if (requested && isUrlOnOrigin(requested, framingOrigin())) {
      sessionStorage.setItem(BOOKMARKLET_TARGET_KEY, requested);
    }
    return sessionStorage.getItem(BOOKMARKLET_TARGET_KEY) ?? own;
  } catch {
    return requested && isUrlOnOrigin(requested, framingOrigin())
      ? requested
      : own;
  }
};

// Runs on the job posting's page, so it cannot call the API (no bearer token,
// and the page's CSP may block it). It opens the target first, inside the
// click, so popup blockers allow it, then expands collapsed sections
// ("… more"), which keep their text out of the page until opened. It posts the
// page to the target's origin until it acknowledges, since the new tab may
// still be loading or redirecting to login.
export const buildBookmarklet = (target: string) => {
  const origin = new URL(target).origin;
  return `javascript:(function(){var o=${escapeUnsafeJsChars(JSON.stringify(origin))};var w=window.open(${escapeUnsafeJsChars(JSON.stringify(target))});document.querySelectorAll('[aria-expanded="false"]').forEach(function(b){if(${BOOKMARKLET_EXPANDER_PATTERN}.test(b.innerText))b.click()});setTimeout(function(){var m={source:'${JOB_APPLICATION_BOOKMARKLET.MESSAGE_SOURCE}',url:location.href,title:document.title,text:document.body.innerText.slice(0,${BOOKMARKLET_TEXT_LIMIT})};var t=setInterval(function(){w.postMessage(m,o)},${BOOKMARKLET_RETRY_MS});window.addEventListener('message',function(e){if(e.origin===o&&e.data==='${JOB_APPLICATION_BOOKMARKLET.ACK}')clearInterval(t)});setTimeout(function(){clearInterval(t)},${BOOKMARKLET_GIVE_UP_MS})},${BOOKMARKLET_EXPAND_WAIT_MS})})()`;
};
