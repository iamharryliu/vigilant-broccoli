from typing import List


class Solution:
    @classmethod
    def combinationSum(self, candidates: List[int], target: int) -> List[List[int]]:
        res = []

        def backtrack(i=0, arr=[]):
            if i == len(candidates) or sum(arr) > target:
                return
            if sum(arr) == target:
                res.append(arr)
                return
            backtrack(i, arr + [candidates[i]])
            backtrack(i + 1, arr)

        backtrack()
        return res
