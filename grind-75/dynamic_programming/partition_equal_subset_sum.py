from functools import cache
from typing import List


class Solution:
    @classmethod
    def canPartition(self, nums: List[int]) -> bool:
        if sum(nums) % 2:
            return False
        target = sum(nums) // 2

        @cache
        def dfs(i, s):
            if s == target:
                return True
            if i == len(nums) or s > target:
                return False
            return dfs(i + 1, s) or dfs(i + 1, s + nums[i])

        return dfs(0, 0)
