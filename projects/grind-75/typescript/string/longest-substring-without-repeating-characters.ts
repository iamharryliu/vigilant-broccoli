export default function lengthOfLongestSubstring(s: string): number {
  const cIndex: Record<string, number> = {};
  let left = 0;
  let res = 0;

  for (let right = 0; right < s.length; right++) {
    const c = s[right];
    if (c in cIndex && left <= cIndex[c]) {
      left = cIndex[c] + 1;
    }
    cIndex[c] = right;
    res = Math.max(res, right - left + 1);
  }

  return res;
}
