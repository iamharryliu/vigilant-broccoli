from typing import List


class Solution:
    @classmethod
    def maxArea(self, height: List[int]) -> int:
        l = 0
        r = len(height) - 1
        res = 0

        while l < r:
            width = r - l
            if height[l] < height[r]:
                area = width * height[l]
                l += 1
            else:
                area = width * height[r]
                r -= 1
            res = max(res, area)
        return res
