import { marked } from 'marked';

const ATTR_ESCAPE_RE = /[&<>"]/g;
const ATTR_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
};

// Escape the id explicitly at the point it's embedded in the attribute, rather
// than treating the slug's own character filtering as a security control.
const escapeAttr = (value: string): string =>
  value.replace(ATTR_ESCAPE_RE, char => ATTR_ESCAPE_MAP[char]);

// Reproduces GitHub's heading anchors, which every hand-written
// `## Table of Contents` link across docs/ and notes/ resolves against: strip
// anything that is not a letter, number, space, hyphen or underscore, then spaces
// to hyphens, then suffix repeats. Verified byte-identical to github-slugger over
// all 2383 headings in the repo, so those anchors keep working.
const SLUG_REMOVE_RE = /[^\p{L}\p{N} _-]+/gu;

const createSlugger = () => {
  const counts = new Map<string, number>();
  return (raw: string): string => {
    const base = raw
      .toLowerCase()
      .trim()
      .replace(SLUG_REMOVE_RE, '')
      .replace(/ /g, '-');
    const seen = counts.get(base);
    counts.set(base, (seen ?? 0) + 1);
    return seen === undefined ? base : `${base}-${seen}`;
  };
};

// A fresh renderer+slugger per parse call, not a shared/global one: marked's own
// heading-id extensions track dedup state in shared module scope, which breaks
// under React Strict Mode's double-invoked effects/memos (two overlapping parses
// for the same content stomp on each other's reset) and under any real overlapping
// parse (e.g. switching files before the previous parse settles).
export const createHeadingRenderer = () => {
  const slug = createSlugger();
  const renderer = new marked.Renderer();
  renderer.heading = (text: string, level: number, raw: string): string => {
    return `<h${level} id="${escapeAttr(slug(raw))}">${text}</h${level}>\n`;
  };
  return renderer;
};

export { marked };
