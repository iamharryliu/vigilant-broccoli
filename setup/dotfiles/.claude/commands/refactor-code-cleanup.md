Double check implementation and do a cleanup if necessary.

Also:

- Try to reduce string literals by using consts. Skip styling-related strings (CSS values, Tailwind classes, inline style objects, color/sizing tokens) — leave those inline.
- For HTTP-related literals (methods, headers, status codes, common header names), prefer the shared consts in `libs/@vigilant-broccoli/common-js/src/lib/http/http.consts.ts` (`HTTP_METHOD`, `HTTP_HEADERS`, `HTTP_STATUS_CODES`, etc.) over defining local equivalents.
