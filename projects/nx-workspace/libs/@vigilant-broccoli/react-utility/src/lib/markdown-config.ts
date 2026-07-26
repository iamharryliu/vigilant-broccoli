import { marked } from 'marked';
import GithubSlugger from 'github-slugger';

const HTML_TAG_RE = /<[!/a-z].*?>/gi;
const ATTR_ESCAPE_RE = /[&<>"]/g;
const ATTR_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
};

// The tag-stripping regex above is only a slug-quality cleanup (drop inline HTML
// remnants before slugifying), not a security control — it's not exhaustive, and
// the slug library's own character filtering isn't something to rely on for that
// either. Escape the id explicitly at the point it's embedded in the attribute.
const escapeAttr = (value: string): string =>
  value.replace(ATTR_ESCAPE_RE, char => ATTR_ESCAPE_MAP[char]);

// A fresh renderer+slugger per parse call, not a shared/global one: marked's own
// heading-id extensions track dedup state in shared module scope, which breaks
// under React Strict Mode's double-invoked effects/memos (two overlapping parses
// for the same content stomp on each other's reset) and under any real overlapping
// parse (e.g. switching files before the previous parse settles).
export const createHeadingRenderer = () => {
  const slugger = new GithubSlugger();
  const renderer = new marked.Renderer();
  renderer.heading = (text: string, level: number, raw: string): string => {
    const id = slugger.slug(raw.toLowerCase().trim().replace(HTML_TAG_RE, ''));
    return `<h${level} id="${escapeAttr(id)}">${text}</h${level}>\n`;
  };
  return renderer;
};

export { marked };
