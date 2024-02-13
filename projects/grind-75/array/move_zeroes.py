from typing import List


class Solution:
    @classmethod
    def moveZeroes(self, nums: List[int]) -> None:
        """
        Do not return anything, modify nums in-place instead.
        """
        l = 0
        r = len(nums) - 1
        while l < r:
            if nums[l] == 0:
                nums.append(nums.pop(l))
                r -= 1
                l -= 1
            l += 1
