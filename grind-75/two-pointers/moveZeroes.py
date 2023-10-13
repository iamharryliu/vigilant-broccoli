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


nums = [0, 1, 0, 3, 12]
output = [1, 3, 12, 0, 0]
res = Solution.moveZeroes(nums)
print(nums == output)

nums = [0]
output = [0]
res = Solution.moveZeroes(nums)
print(nums == output)
