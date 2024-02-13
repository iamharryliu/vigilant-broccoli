from typing import List


class Solution:
    @classmethod
    def missingNumber(self, nums: List[int]) -> int:
        return sum(i for i in range(len(nums) + 1)) - sum(nums)
