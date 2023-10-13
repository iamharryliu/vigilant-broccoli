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


intervals = [[1, 3], [6, 9]]
newInterval = [2, 5]
output = [[1, 5], [6, 9]]
res = Solution.insert(intervals, newInterval)
print(res == output)

intervals = [[1, 2], [3, 5], [6, 7], [8, 10], [12, 16]]
newInterval = [4, 8]
output = [[1, 2], [3, 10], [12, 16]]
res = Solution.insert(intervals, newInterval)
print(res == output)
