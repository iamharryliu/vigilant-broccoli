from collections import deque
from typing import List


class Solution:
    @classmethod
    def updateMatrix(self, mat: List[List[int]]) -> List[List[int]]:
        q = deque()
        visited = set()
        directions = [[1, 0], [-1, 0], [0, 1], [0, -1]]

        for r in range(len(mat)):
            for c in range(len(mat[0])):
                if mat[r][c] == 0:
                    visited.add((r, c))
                    q.append((r, c))

        while q:
            r, c = q.popleft()
            for x, y in directions:
                nr = r + x
                nc = c + y
                if (
                    0 <= nr < len(mat)
                    and 0 <= nc < len(mat[0])
                    and (nr, nc) not in visited
                ):
                    visited.add((nr, nc))
                    q.append((nr, nc))
                    mat[nr][nc] = mat[r][c] + 1
        return mat


mat = [[0, 0, 0], [0, 1, 0], [0, 0, 0]]
output = [[0, 0, 0], [0, 1, 0], [0, 0, 0]]
res = Solution.updateMatrix(mat) == output
print(res)

mat = [[0, 0, 0], [0, 1, 0], [1, 1, 1]]
output = [[0, 0, 0], [0, 1, 0], [1, 2, 1]]
res = Solution.updateMatrix(mat) == output
print(res)
