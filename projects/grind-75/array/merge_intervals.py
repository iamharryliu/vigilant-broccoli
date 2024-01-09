from typing import List


class Solution:
    @classmethod
    def merge(self, intervals: List[List[int]]) -> List[List[int]]:
        intervals.sort(key=lambda i: i[0])
        res = [intervals[0]]
        for s, e in intervals[1:]:
            previous_e = res[-1][1]
            if s <= previous_e:
                res[-1][1] = max(previous_e, e)
            else:
                res.append([s, e])
        return res
