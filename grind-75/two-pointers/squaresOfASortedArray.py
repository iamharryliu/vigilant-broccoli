from typing import List


class Solution:
    @classmethod
    def sortedSquares(self, nums: List[int]) -> List[int]:
        l = 0
        r = len(nums) - 1
        res = []
        while l <= r:
            if nums[l] ** 2 > nums[r] ** 2:
                res = [nums[l] ** 2] + res
                l += 1
            else:
                res = [nums[r] ** 2] + res
                r -= 1
        return res


nums = [-4, -1, 0, 3, 10]
output = [0, 1, 9, 16, 100]
res = Solution.sortedSquares(nums)
print(res == output)

nums = [-7, -3, 2, 3, 11]
output = [4, 9, 9, 49, 121]
res = Solution.sortedSquares(nums)
print(res == output)
