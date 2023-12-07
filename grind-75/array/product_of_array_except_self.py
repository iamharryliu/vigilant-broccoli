class Solution:
    @classmethod
    def productExceptSelf(self, nums):
        res = [1] * len(nums)

        p = 1
        for i in range(len(nums)):
            res[i] *= p
            p *= nums[i]

        p = 1
        for i in range(len(nums) - 1, -1, -1):
            res[i] *= p
            p *= nums[i]
        return res
