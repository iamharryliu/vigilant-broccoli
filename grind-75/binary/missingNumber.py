from typing import List


class Solution:
    def missingNumber(self, nums: List[int]) -> int:

        # res = len(nums)
        # for i, num in enumerate(nums):
        #     res += i - num
        # return res

        return sum(num for num in range(len(nums) + 1)) - sum(nums)
