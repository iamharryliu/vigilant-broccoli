import DOMPurify from 'isomorphic-dompurify';

const ALLOWED_TAGS = [
  'a',
  'b',
  'br',
  'div',
  'em',
  'hr',
  'i',
  'img',
  'li',
  'ol',
  'p',
  'small',
  'span',
  'strong',
  'sub',
  'sup',
  'table',
  'tbody',
  'td',
  'tr',
  'u',
  'ul',
];

const ALLOWED_ATTR = ['href', 'src', 'alt', 'title', 'style', 'target', 'rel'];

export const sanitizeSignatureHtml = (html: string): string =>
  DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR });
