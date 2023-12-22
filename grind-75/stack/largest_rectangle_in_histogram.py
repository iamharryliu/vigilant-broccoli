from typing import List


class Solution:
    @classmethod
    def largestRectangleArea(self, heights: List[int]) -> int:
        stack = []
        res = 0

        for i, h in enumerate(heights):
            start = i
            while stack and stack[-1][1] > h:
                pi, ph = stack.pop()
                start = pi
                res = max(res, ph * (i - start))
            stack.append((start, h))

        for pi, ph in stack:
            area = ph * (len(heights) - pi)
            res = max(res, area)

        return res


heights = [2, 1, 5, 6, 2, 3]
output = 10
res = Solution.largestRectangleArea(heights)
print(res == output)

heights = [2, 4]
output = 4
res = Solution.largestRectangleArea(heights)
print(res == output)
