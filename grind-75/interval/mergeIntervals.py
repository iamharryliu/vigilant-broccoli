from typing import List


class Solution:
    @classmethod
    def merge(self, intervals: List[List[int]]) -> List[List[int]]:
        intervals.sort(key=lambda i: i[0])
        res = [intervals[0]]
        for start, end in intervals[1:]:
            last_end = res[-1][1]
            if start <= last_end:
                res[-1][1] = max(last_end, end)
            else:
                res.append([start, end])
        return res


res = Solution.merge([[1, 3], [2, 6], [8, 10], [15, 18]])
print(res == [[1, 6], [8, 10], [15, 18]])
