import { marked } from 'marked';
import GithubSlugger from 'github-slugger';

const HTML_TAG_RE = /<[!/a-z].*?>/gi;

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
    return `<h${level} id="${id}">${text}</h${level}>\n`;
  };
  return renderer;
};

export { marked };
