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


candidates = [2, 3, 6, 7]
target = 7
output = [[2, 2, 3], [7]]
res = Solution.combinationSum(candidates, target)
print(res == output)

candidates = [2, 3, 5]
target = 8
output = [[2, 2, 2, 2], [2, 3, 3], [3, 5]]
res = Solution.combinationSum(candidates, target)
print(res == output)

candidates = [2]
target = 1
output = []
res = Solution.combinationSum(candidates, target)
print(res == output)
