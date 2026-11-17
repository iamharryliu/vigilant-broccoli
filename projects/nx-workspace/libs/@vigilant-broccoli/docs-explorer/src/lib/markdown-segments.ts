export interface SegmentItem {
  id: string;
  title: string;
  open: boolean;
  segments: Segment[];
}

export type Segment =
  { kind: 'html'; html: string } | { kind: 'group'; items: SegmentItem[] };

const DETAILS = 'DETAILS';
const SUMMARY = 'SUMMARY';

// Splits sanitized HTML at its top-level `<details>` blocks so each can render
// as a CollapsibleList item; consecutive blocks share one list. Anything else,
// including a `<details>` nested in other markup, stays as plain HTML.
export const buildSegments = (
  html: string,
  idPrefix = 'details',
): Segment[] => {
  const { body } = new DOMParser().parseFromString(html, 'text/html');
  const segments: Segment[] = [];
  let buffer = '';

  const flush = () => {
    if (buffer.trim()) segments.push({ kind: 'html', html: buffer });
    buffer = '';
  };

  body.childNodes.forEach(node => {
    if (node.nodeName !== DETAILS) {
      const isGap =
        node.nodeType === Node.TEXT_NODE && !node.textContent?.trim();
      const last = segments[segments.length - 1];
      if (isGap && !buffer && last?.kind === 'group') return;
      buffer +=
        node.nodeType === Node.ELEMENT_NODE
          ? (node as Element).outerHTML
          : (node.textContent ?? '');
      return;
    }
    flush();
    const details = node as HTMLDetailsElement;
    const summary = Array.from(details.children).find(
      child => child.nodeName === SUMMARY,
    );
    const title = summary?.textContent?.trim() ?? '';
    summary?.remove();
    const last = segments[segments.length - 1];
    const group =
      last?.kind === 'group'
        ? last
        : segments[segments.push({ kind: 'group', items: [] }) - 1];
    if (group.kind !== 'group') return;
    const id = `${idPrefix}-${group.items.length}-${segments.length}`;
    group.items.push({
      id,
      title,
      open: details.hasAttribute('open'),
      segments: buildSegments(details.innerHTML, id),
    });
  });
  flush();
  return segments;
};

// Opens the first `count` top-level items across all groups, on top of any that
// carry their own `open` attribute.
export const openLeadingItems = (
  segments: Segment[],
  count: number,
): Segment[] => {
  let remaining = count;
  return segments.map(segment => {
    if (segment.kind !== 'group') return segment;
    return {
      ...segment,
      items: segment.items.map(item => ({
        ...item,
        open: item.open || remaining-- > 0,
      })),
    };
  });
};
