import math
from typing import List


class Solution:
    @classmethod
    def threeSumClosest(self, nums: List[int], target: int) -> int:
        res = math.inf
        nums.sort()
        for i, num in enumerate(nums):
            if i > 0 and num == nums[i - 1]:
                continue
            l = i + 1
            r = len(nums) - 1
            while l < r:
                total = num + nums[l] + nums[r]
                if total < target:
                    l += 1
                if total > target:
                    r -= 1
                if total == target:
                    return total
                if abs(target - total) < abs(target - res):
                    res = total

        return res
