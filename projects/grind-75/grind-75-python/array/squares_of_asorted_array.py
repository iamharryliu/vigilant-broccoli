from typing import List


class Solution:
    @classmethod
    def sortedSquares(self, nums: List[int]) -> List[int]:
        l = 0
        r = len(nums) - 1
        res = []
        while l <= r:
            lsquared = nums[l] ** 2
            rsquared = nums[r] ** 2
            if lsquared < rsquared:
                res = [rsquared] + res
                r -= 1
            else:
                res = [lsquared] + res
                l += 1
        return res
