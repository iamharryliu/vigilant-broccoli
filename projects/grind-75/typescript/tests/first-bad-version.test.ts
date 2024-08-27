import { solution } from '../binary-search/first-bad-verison';

const isBadVersionGenerator = (firstBadVersion: number) => {
  return (version: number) => version >= firstBadVersion;
};

describe('solution', () => {
  test('finds the first bad version correctly', () => {
    const isBadVersion = isBadVersionGenerator(4);
    const findFirstBadVersion = solution(isBadVersion);
    expect(findFirstBadVersion(5)).toBe(4);
  });

  test('handles case where first bad version is the first one', () => {
    const isBadVersion = isBadVersionGenerator(1);
    const findFirstBadVersion = solution(isBadVersion);
    expect(findFirstBadVersion(1)).toBe(1);
  });
});
