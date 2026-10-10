const MAX_DIFF_CELLS = 4_000_000;

export const DIFF_LINE_KIND = {
  SAME: 'same',
  ADDED: 'added',
  REMOVED: 'removed',
} as const;

export type DiffLineKind = (typeof DIFF_LINE_KIND)[keyof typeof DIFF_LINE_KIND];

export interface DiffLine {
  kind: DiffLineKind;
  text: string;
}

const toLines = (text: string): string[] =>
  text === '' ? [] : text.split('\n');

export const diffLines = (before: string, after: string): DiffLine[] => {
  const a = toLines(before);
  const b = toLines(after);

  if (a.length * b.length > MAX_DIFF_CELLS) {
    return [
      ...a.map(text => ({ kind: DIFF_LINE_KIND.REMOVED, text })),
      ...b.map(text => ({ kind: DIFF_LINE_KIND.ADDED, text })),
    ];
  }

  const lcs = Array.from({ length: a.length + 1 }, () =>
    new Array<number>(b.length + 1).fill(0),
  );
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      lcs[i][j] =
        a[i] === b[j]
          ? lcs[i + 1][j + 1] + 1
          : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }

  const result: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      result.push({ kind: DIFF_LINE_KIND.SAME, text: a[i] });
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      result.push({ kind: DIFF_LINE_KIND.REMOVED, text: a[i++] });
    } else {
      result.push({ kind: DIFF_LINE_KIND.ADDED, text: b[j++] });
    }
  }
  while (i < a.length)
    result.push({ kind: DIFF_LINE_KIND.REMOVED, text: a[i++] });
  while (j < b.length)
    result.push({ kind: DIFF_LINE_KIND.ADDED, text: b[j++] });
  return result;
};
