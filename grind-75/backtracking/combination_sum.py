from typing import List


class Solution:
    @classmethod
    def combinationSum(self, candidates: List[int], target: int) -> List[List[int]]:
        res = []

        def dfs(i, arr):
            if i == len(candidates) or sum(arr) > target:
                return
            if sum(arr) == target:
                res.append(arr)
                return
            dfs(i, arr + [candidates[i]])
            dfs(i + 1, arr)

        dfs(0, [])
        return res
