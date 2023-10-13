from typing import List


class Solution:
    @classmethod
    def floodFill(
        self, image: List[List[int]], sr: int, sc: int, color: int
    ) -> List[List[int]]:
        old_color = image[sr][sc]
        visited = set()
        directions = [[1, 0], [-1, 0], [0, 1], [0, -1]]

        def dfs(r, c):
            image[r][c] = color
            for x, y in directions:
                nr = r + x
                nc = c + y
                if (
                    0 <= nr < len(image)
                    and 0 <= nc < len(image[0])
                    and (nr, nc) not in visited
                    and image[nr][nc] == old_color
                ):
                    visited.add((nr, nc))
                    dfs(nr, nc)

        dfs(sr, sc)

        return image


print(
    Solution.floodFill(image=[[1, 1, 1], [1, 1, 0], [1, 0, 1]], sr=1, sc=1, newColor=2)
    == [[2, 2, 2], [2, 2, 0], [2, 0, 1]]
)
