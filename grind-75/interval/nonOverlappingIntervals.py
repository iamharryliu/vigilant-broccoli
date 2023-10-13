from typing import List


class Solution:
    @classmethod
    def eraseOverlapIntervals(self, intervals: List[List[int]]) -> int:
        intervals.sort()
        res = 0
        lastEnd = intervals[0][1]
        for start, end in intervals[1:]:
            if lastEnd <= start:
                lastEnd = end
            else:
                res += 1
                lastEnd = min(lastEnd, end)
        return res


print(Solution.eraseOverlapIntervals([[1, 2], [2, 3], [3, 4], [1, 3]]) == 1)
print(Solution.eraseOverlapIntervals([[1, 2], [1, 2], [1, 2]]) == 2)
print(Solution.eraseOverlapIntervals([[1, 2], [2, 3]]) == 0)
