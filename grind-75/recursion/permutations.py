from typing import List


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
