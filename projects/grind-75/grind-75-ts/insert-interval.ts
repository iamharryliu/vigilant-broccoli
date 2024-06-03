export function insert(
  intervals: number[][],
  newInterval: number[],
): number[][] {
  let res: number[][] = [];

  for (let i = 0; i < intervals.length; i++) {
    const interval = intervals[i];
    if (interval[1] < newInterval[0]) {
      res.push(intervals[i]);
    } else if (interval[0] > newInterval[1]) {
      res.push(newInterval);
      return res.concat(intervals.slice(i));
    } else {
      newInterval = [
        Math.min(interval[0], newInterval[0]),
        Math.max(interval[1], newInterval[1]),
      ];
    }
  }
  return res.concat(newInterval);
}
