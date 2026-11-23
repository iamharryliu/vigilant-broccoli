// Phone-width typography below `sm`, all behind `max-sm:` so `sm` and up stay
// plain `prose`: `prose-sm sm:prose-base` is not identical, because a size
// modifier's `code` rule outranks base `prose`'s `pre code { font-size: inherit }`
// and shrinks code blocks (hence the explicit inherit below).
export const COMPACT_PROSE_CLS = [
  'prose max-sm:prose-sm dark:prose-invert max-w-none max-sm:break-words',
  'max-sm:prose-h1:text-2xl max-sm:prose-h2:text-lg max-sm:prose-h3:text-base',
  'max-sm:prose-h2:mt-5 max-sm:prose-h3:mt-4 max-sm:prose-headings:mb-2',
  'max-sm:prose-p:my-2 max-sm:prose-ul:my-2 max-sm:prose-ol:my-2 max-sm:prose-li:my-0.5',
  'max-sm:prose-ul:pl-4 max-sm:prose-ol:pl-4 max-sm:prose-blockquote:pl-3',
  'max-sm:prose-pre:my-3 max-sm:prose-pre:px-3 max-sm:prose-pre:py-2 max-sm:[&_pre>code]:text-[length:inherit]',
  'max-sm:prose-table:text-xs max-sm:prose-th:px-1.5 max-sm:prose-td:px-1.5 max-sm:prose-td:py-1',
  'max-sm:prose-img:my-3',
].join(' ');
