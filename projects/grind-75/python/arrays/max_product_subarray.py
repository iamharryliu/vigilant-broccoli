import math


class Solution:
    @classmethod
    def maxProduct(self, nums):
        res = max(nums)
        cmin, cmax = 1, 1

        for num in nums:
            if num != 0:
                cmin, cmax = (
                    min(cmax * num, num * cmin, num),
                    max(cmax * num, num * cmin, num),
                )
                res = max(res, cmax)
            else:
                cmin, cmax = 1, 1
        return res


nums = [2, 3, -2, 4]
output = 6
res = Solution.maxProduct(nums)
print(res == output)

nums = [-2, 0, -1]
output = 0
res = Solution.maxProduct(nums)
print(res == output)
