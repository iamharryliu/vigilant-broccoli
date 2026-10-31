import {
  CALENDAR_EVENT_BOOKMARKLET,
  CalendarEventBookmarkletMessage,
} from '@vigilant-broccoli/common-js';

// Sized for the extraction prompt, which reads the text as-is.
const BOOKMARKLET_TEXT_LIMIT = 20000;
const BOOKMARKLET_RETRY_MS = 300;
const BOOKMARKLET_GIVE_UP_MS = 15000;
const STRUCTURED_DATA_LIMIT = 8000;

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
  ' ': '\\u2028',
  ' ': '\\u2029',
};

// Built from a string so the compiler cannot emit raw U+2028/U+2029 into a
// regex literal, which is a syntax error.
const UNSAFE_JS_CHARS = new RegExp(
  '[<>/\\b\\f\\n\\r\\t\\0\\u2028\\u2029]',
  'g',
);

const escapeUnsafeJsChars = (value: string) =>
  value.replace(UNSAFE_JS_CHARS, char => UNSAFE_JS_CHAR_MAP[char]);

// Runs on the event page, so it cannot call the API (no bearer token, and the
// page's CSP may block it). It opens the manager first, inside the click, so
// popup blockers allow it, then posts the page to the manager's origin until
// it acknowledges, since the new tab may still be loading or redirecting to
// login.
export const buildCalendarEventBookmarklet = (origin: string) => {
  const target = `${origin}/?${CALENDAR_EVENT_BOOKMARKLET.TARGET_PARAM}=1`;
  return `javascript:(function(){var o=${escapeUnsafeJsChars(JSON.stringify(origin))};var w=window.open(${escapeUnsafeJsChars(JSON.stringify(target))});if(!w)return;var m={source:'${CALENDAR_EVENT_BOOKMARKLET.MESSAGE_SOURCE}',url:location.href,title:document.title,selection:String(getSelection()).slice(0,${BOOKMARKLET_TEXT_LIMIT}),structuredData:[].map.call(document.querySelectorAll('script[type="application/ld+json"]'),function(s){return s.textContent.slice(0,${STRUCTURED_DATA_LIMIT})}),text:document.body.innerText.slice(0,${BOOKMARKLET_TEXT_LIMIT})};var t=setInterval(function(){w.postMessage(m,o)},${BOOKMARKLET_RETRY_MS});window.addEventListener('message',function(e){if(e.origin===o&&e.data==='${CALENDAR_EVENT_BOOKMARKLET.ACK}')clearInterval(t)});setTimeout(function(){clearInterval(t)},${BOOKMARKLET_GIVE_UP_MS})})()`;
};

// A selection is the user's own pick of the event, so it replaces the page text.
export const composeCalendarEventText = ({
  url,
  title,
  selection,
  structuredData,
  text,
}: CalendarEventBookmarkletMessage) => {
  const body = selection?.trim() || text?.trim();
  const data = (structuredData ?? [])
    .join('\n')
    .trim()
    .slice(0, STRUCTURED_DATA_LIMIT);
  return [
    title && `Title: ${title}`,
    `URL: ${url}`,
    body,
    data && `Structured data:\n${data}`,
  ]
    .filter(Boolean)
    .join('\n\n');
};
