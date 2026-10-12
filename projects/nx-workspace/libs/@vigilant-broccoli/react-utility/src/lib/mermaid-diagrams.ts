import { isDarkTheme, PREFERS_DARK_QUERY } from './theme';

const CODE_SELECTOR = 'code.language-mermaid';
const SOURCE_KEY = 'mermaidSource';
const TARGET_SELECTOR = `pre:has(> ${CODE_SELECTOR}), .mermaid-diagram`;
const RENDER_ID_PREFIX = 'mermaid-diagram-';
const THEME = { DARK: 'dark', LIGHT: 'default' } as const;
const SECURITY_LEVEL = 'strict';
const SVG_MIME_TYPE = 'image/svg+xml';
const CLASS_ATTR = 'class';
const STYLE_ATTR = 'style';

let renderCount = 0;

export const MERMAID_DIAGRAM_CLS =
  'mermaid-diagram not-prose my-4 flex justify-center overflow-x-auto';

export const renderMermaidDiagrams = async (
  container: HTMLElement | null,
): Promise<void> => {
  if (!container) return;
  const targets = Array.from(
    container.querySelectorAll<HTMLElement>(TARGET_SELECTOR),
  );
  if (targets.length === 0) return;

  const { default: mermaid } = await import('mermaid');
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: SECURITY_LEVEL,
    theme: isDarkTheme(container) ? THEME.DARK : THEME.LIGHT,
  });

  for (const target of targets) {
    if (!target.isConnected) continue;
    const source =
      target.dataset[SOURCE_KEY] ??
      target.querySelector(CODE_SELECTOR)?.textContent ??
      '';
    const id = `${RENDER_ID_PREFIX}${renderCount++}`;
    try {
      const { svg } = await mermaid.render(id, source);
      const diagram = document.createElement('div');
      diagram.className = MERMAID_DIAGRAM_CLS;
      diagram.dataset[SOURCE_KEY] = source;
      diagram.replaceChildren(
        new DOMParser().parseFromString(svg, SVG_MIME_TYPE).documentElement,
      );
      target.replaceWith(diagram);
    } catch {
      // Invalid syntax: keep the original block. mermaid leaves its error
      // element in <body>, so remove it.
      document.getElementById(`d${id}`)?.remove();
    }
  }
};

// Re-runs the callback whenever the theme may have changed (class/style on any
// ancestor, or the OS color scheme).
export const observeThemeChange = (
  el: HTMLElement,
  onChange: () => void,
): (() => void) => {
  const observer = new MutationObserver(onChange);
  for (let node: HTMLElement | null = el; node; node = node.parentElement) {
    observer.observe(node, {
      attributes: true,
      attributeFilter: [CLASS_ATTR, STYLE_ATTR],
    });
  }
  const media = window.matchMedia?.(PREFERS_DARK_QUERY);
  media?.addEventListener('change', onChange);
  return () => {
    observer.disconnect();
    media?.removeEventListener('change', onChange);
  };
};
