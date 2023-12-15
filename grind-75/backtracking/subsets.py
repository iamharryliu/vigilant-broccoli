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
