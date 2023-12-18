from typing import List


class Solution:
    @classmethod
    def spiralOrder(self, matrix: List[List[int]]) -> List[int]:
        visited = set()
        res = []

        def dfs(r=0, c=0):
            if (
                0 <= r < len(matrix)
                and 0 <= c < len(matrix[0])
                and (r, c) not in visited
            ):
                visited.add((r, c))
                res.append(matrix[r][c])
                if r <= c + 1:
                    dfs(r, c + 1)
                dfs(r + 1, c)
                dfs(r, c - 1)
                dfs(r - 1, c)

        dfs()
        return res
