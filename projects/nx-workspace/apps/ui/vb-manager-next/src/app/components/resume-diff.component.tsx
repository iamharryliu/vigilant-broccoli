'use client';

const DIFF_LINE_TYPE = {
  ADDED: 'added',
  REMOVED: 'removed',
  UNCHANGED: 'unchanged',
} as const;

type DiffLineType = (typeof DIFF_LINE_TYPE)[keyof typeof DIFF_LINE_TYPE];

type DiffLine = { type: DiffLineType; text: string };

const DIFF_PREFIX: Record<DiffLineType, string> = {
  [DIFF_LINE_TYPE.ADDED]: '+',
  [DIFF_LINE_TYPE.REMOVED]: '-',
  [DIFF_LINE_TYPE.UNCHANGED]: ' ',
};

const DIFF_LINE_CLASS: Record<DiffLineType, string> = {
  [DIFF_LINE_TYPE.ADDED]: 'bg-green-100 text-green-900',
  [DIFF_LINE_TYPE.REMOVED]: 'bg-red-100 text-red-900',
  [DIFF_LINE_TYPE.UNCHANGED]: 'text-gray-600',
};

const LINE_SEPARATOR = '\n';
const NO_CHANGES_MESSAGE = 'No changes from the committed resume.json.';

const diffLines = (before: string, after: string): DiffLine[] => {
  const a = before.trimEnd().split(LINE_SEPARATOR);
  const b = after.trimEnd().split(LINE_SEPARATOR);
  const lcs: number[][] = Array.from({ length: a.length + 1 }, () =>
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
      result.push({ type: DIFF_LINE_TYPE.UNCHANGED, text: a[i] });
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      result.push({ type: DIFF_LINE_TYPE.REMOVED, text: a[i++] });
    } else {
      result.push({ type: DIFF_LINE_TYPE.ADDED, text: b[j++] });
    }
  }
  while (i < a.length)
    result.push({ type: DIFF_LINE_TYPE.REMOVED, text: a[i++] });
  while (j < b.length)
    result.push({ type: DIFF_LINE_TYPE.ADDED, text: b[j++] });
  return result;
};

export const ResumeDiffComponent = ({
  original,
  current,
}: {
  original: string;
  current: string;
}) => {
  if (original.trimEnd() === current.trimEnd()) {
    return <p className="text-sm text-gray-500">{NO_CHANGES_MESSAGE}</p>;
  }
  return (
    <pre className="h-full overflow-auto rounded border text-xs font-mono">
      {diffLines(original, current).map((line, index) => (
        <div key={index} className={DIFF_LINE_CLASS[line.type]}>
          {DIFF_PREFIX[line.type]} {line.text}
        </div>
      ))}
    </pre>
  );
};
