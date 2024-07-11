from typing import List


class Solution:
    @classmethod
    def combinationSum(self, candidates: List[int], target: int) -> List[List[int]]:
        res = []

        def backtrack(i=0, curr=[], total=0):
            if i == len(candidates) or total > target:
                return
            if sum(curr) == target:
                res.append(curr[:])
                return
            num = candidates[i]
            backtrack(i, curr + [num], total + num)
            backtrack(i + 1, curr, total)

        backtrack()
        return res


"""
Time Complexity - O(2ⁿ)
Space Complexity - O(target / min(candidates))
"""
