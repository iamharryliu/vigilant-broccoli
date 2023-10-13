import math


class Solution:
    @classmethod
    def maxSubArray(self, nums):
        curr = 0
        res = -math.inf
        for num in nums:
            curr = max(curr + num, num)
            res = max(res, curr)
        return res

        # Alternate solution
        # for i, num in enumerate(nums):
        #     if i > 0:
        #         nums[i] = max(num, num + nums[i - 1])
        # return max(nums)


# [-2, 1, -3, 4, -1, 2, 1, -5, 4]
# [-2, 1, -3, 4, -1, 2, 1, -5, 4]
# [-2, 1, -2, 4, -1, 2, 1, -5, 4]
# [-2, 1, -2, 4, -1, 2, 1, -5, 4]
# [-2, 1, -2, 4, 3, 2, 1, -5, 4]
# [-2, 1, -2, 4, 3, 5, 1, -5, 4]
# [-2, 1, -2, 4, 3, 5, 6, -5, 4]
# [-2, 1, -2, 4, 3, 5, 6, 1, 4]

nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]
result = Solution.maxSubArray(nums)
print(result)
