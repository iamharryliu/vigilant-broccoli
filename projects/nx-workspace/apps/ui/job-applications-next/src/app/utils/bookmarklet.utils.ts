import { ROOT_PATH } from '../app.const';

const BOOKMARKLET_MESSAGE_SOURCE = 'job-application-bookmarklet';
export const BOOKMARKLET_ACK = 'job-application-ack';
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

type BookmarkletMessage = {
  source: typeof BOOKMARKLET_MESSAGE_SOURCE;
  url: string;
  title?: string;
  text: string;
};

export const isBookmarkletMessage = (
  data: unknown,
): data is BookmarkletMessage =>
  typeof data === 'object' &&
  data !== null &&
  (data as BookmarkletMessage).source === BOOKMARKLET_MESSAGE_SOURCE;

// Runs on the job posting's page, so it cannot call the API (no bearer token,
// and the page's CSP may block it). It opens this app first, inside the click,
// so popup blockers allow it, then expands collapsed sections ("… more"),
// which keep their text out of the page until opened. It posts the page until
// the app acknowledges, since the new tab may still be loading or redirecting
// to login.
export const buildBookmarklet = (origin: string) =>
  `javascript:(function(){var o=${escapeUnsafeJsChars(JSON.stringify(origin))};var w=window.open(o+'${ROOT_PATH}');document.querySelectorAll('[aria-expanded="false"]').forEach(function(b){if(${BOOKMARKLET_EXPANDER_PATTERN}.test(b.innerText))b.click()});setTimeout(function(){var m={source:'${BOOKMARKLET_MESSAGE_SOURCE}',url:location.href,title:document.title,text:document.body.innerText.slice(0,${BOOKMARKLET_TEXT_LIMIT})};var t=setInterval(function(){w.postMessage(m,o)},${BOOKMARKLET_RETRY_MS});window.addEventListener('message',function(e){if(e.origin===o&&e.data==='${BOOKMARKLET_ACK}')clearInterval(t)});setTimeout(function(){clearInterval(t)},${BOOKMARKLET_GIVE_UP_MS})},${BOOKMARKLET_EXPAND_WAIT_MS})})()`;
