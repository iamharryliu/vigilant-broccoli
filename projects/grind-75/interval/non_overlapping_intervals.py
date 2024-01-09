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
