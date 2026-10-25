export interface ChangedSpan {
  start: number;
  previousEnd: number;
  nextEnd: number;
}

// The single changed span between two strings, from their common prefix and
// suffix: `previous.slice(start, previousEnd)` became
// `next.slice(start, nextEnd)`.
export const findChangedSpan = (
  previous: string,
  next: string,
): ChangedSpan => {
  let start = 0;
  while (
    start < previous.length &&
    start < next.length &&
    previous[start] === next[start]
  ) {
    start++;
  }

  let previousEnd = previous.length;
  let nextEnd = next.length;
  while (
    previousEnd > start &&
    nextEnd > start &&
    previous[previousEnd - 1] === next[nextEnd - 1]
  ) {
    previousEnd--;
    nextEnd--;
  }

  return { start, previousEnd, nextEnd };
};
