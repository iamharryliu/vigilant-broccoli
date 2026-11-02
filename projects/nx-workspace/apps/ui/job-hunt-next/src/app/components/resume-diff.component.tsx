'use client';

import { useTranslation } from '../i18n';

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
  [DIFF_LINE_TYPE.ADDED]:
    'bg-green-100 text-green-900 dark:bg-green-950 dark:text-green-200',
  [DIFF_LINE_TYPE.REMOVED]:
    'bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-200',
  [DIFF_LINE_TYPE.UNCHANGED]: 'text-gray-600 dark:text-gray-400',
};

const LINE_SEPARATOR = '\n';

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
  from,
  to,
}: {
  from: string;
  to: string;
}) => {
  const { t } = useTranslation();
  if (from.trimEnd() === to.trimEnd()) {
    return (
      <p className="text-sm text-muted-foreground">{t('RESUME.NO_CHANGES')}</p>
    );
  }
  return (
    <pre className="min-h-0 flex-1 overflow-auto rounded border font-mono text-xs">
      {diffLines(from, to).map((line, index) => (
        <div key={index} className={DIFF_LINE_CLASS[line.type]}>
          {DIFF_PREFIX[line.type]} {line.text}
        </div>
      ))}
    </pre>
  );
};
