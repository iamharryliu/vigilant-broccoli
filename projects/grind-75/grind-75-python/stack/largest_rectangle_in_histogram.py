from typing import List


class Solution:
    @classmethod
    def largestRectangleArea(self, heights: List[int]) -> int:
        stack = []
        res = 0

        for i, h in enumerate(heights):
            start = i
            while stack and h < stack[-1][1]:
                pi, ph = stack.pop()
                start = pi
                res = max(res, ph * (i - start))
            stack.append((start, h))

        for pi, ph in stack:
            area = ph * (len(heights) - pi)
            res = max(res, area)

        return res
