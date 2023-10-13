from typing import List


class Solution:
    @classmethod
    def subsets(self, nums: List[int]) -> List[List[int]]:
        res = []

        def backtrack(i, curr):
            if i == len(nums):
                res.append(curr)
                return
            backtrack(i + 1, curr)
            backtrack(i + 1, curr + [nums[i]])

        backtrack(0, [])
        return res


nums = [1, 2, 3]
output = [[], [1], [2], [1, 2], [3], [1, 3], [2, 3], [1, 2, 3]]
res = Solution.subsets(nums)
print(sorted(res) == sorted(output))

nums = [0]
output = [[], [0]]
res = Solution.subsets(nums)
print(sorted(res) == sorted(output))
