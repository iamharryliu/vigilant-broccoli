from typing import List


class Solution:
    @classmethod
    def majorityElement(self, nums: List[int]) -> int:
        """
        :type nums: List[int]
        :rtype: int
        """
        for num in set(nums):
            if nums.count(num) > len(nums) // 2:
                return num
