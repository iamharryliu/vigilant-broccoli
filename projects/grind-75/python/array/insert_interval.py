from typing import List


class Solution:
    @classmethod
    def insert(
        self, intervals: List[List[int]], newInterval: List[int]
    ) -> List[List[int]]:
        res = []

        for i, interval in enumerate(intervals):
            if newInterval[1] < interval[0]:
                res.append(newInterval)
                return res + intervals[i:]
            elif interval[1] < newInterval[0]:
                res.append(interval)
            else:
                newInterval = [
                    min(newInterval[0], interval[0]),
                    max(newInterval[1], interval[1]),
                ]

        res.append(newInterval)
        return res


"""
Time Complexity - O(n)
Space Complexity - O(n)
"""
