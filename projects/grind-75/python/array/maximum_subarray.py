import math


class Solution:
    @classmethod
    def maxSubArray(self, nums):
        curr = 0
        res = -math.inf
        for num in nums:
            curr = max(curr + num, num)
            res = max(res, curr)
        return res
