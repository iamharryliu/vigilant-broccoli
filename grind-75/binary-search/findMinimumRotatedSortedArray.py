import math


class Solution:
    @classmethod
    def findMin(self, nums):
        res = math.inf
        l = 0
        r = len(nums) - 1
        while l <= r:
            if nums[l] <= nums[r]:
                return min(res, nums[l])
            m = (l + r) // 2
            res = min(res, nums[m])
            if nums[m] > nums[r]:
                l = m + 1
            else:
                r = m - 1


res = Solution.findMin([3, 4, 5, 1, 2])
print(res)
