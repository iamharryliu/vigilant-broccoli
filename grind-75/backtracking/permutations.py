from typing import List

from black import out


class Solution:
    @classmethod
    def permute(self, nums: List[int]) -> List[List[int]]:
        res = []

        def backtrack(arr):
            if len(arr) == len(nums):
                res.append(arr)
                return
            for n in nums:
                if n not in arr:
                    backtrack(arr + [n])

        backtrack([])
        return res


nums = [1, 2, 3]
res = Solution.permute(nums)
output = [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]
print(res == output)


nums = [0, 1]
res = Solution.permute(nums)
output = [[0, 1], [1, 0]]
print(res == output)

nums = [1]
res = Solution.permute(nums)
output = [[1]]
print(res == output)
