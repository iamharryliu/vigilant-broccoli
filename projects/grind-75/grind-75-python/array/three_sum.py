from typing import List


class Solution:
    @classmethod
    def threeSum(self, nums: List[int]) -> List[List[int]]:
        res = []
        nums.sort()
        for i, num in enumerate(nums):
            if i > 0 and num == nums[i - 1]:
                continue
            l = i + 1
            r = len(nums) - 1
            while l < r:
                total = num + nums[l] + nums[r]
                if total < 0:
                    l += 1
                if total > 0:
                    r -= 1
                if total == 0:
                    res.append((num, nums[l], nums[r]))
                    l += 1
                    while l < r and nums[l] == nums[l - 1]:
                        l += 1
        return res


"""
Time Complexity - O(nlogn)
Space Complexity - O(n)
"""
