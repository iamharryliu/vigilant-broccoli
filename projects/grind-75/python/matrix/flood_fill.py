from typing import List


class Solution:
    @classmethod
    def floodFill(
        self, image: List[List[int]], sr: int, sc: int, color: int
    ) -> List[List[int]]:
        old_color = image[sr][sc]
        if old_color == color:
            return image

        directions = [[1, 0], [-1, 0], [0, 1], [0, -1]]
        number_of_rows, number_of_columns = len(image), len(image[0])

        def dfs(r, c):
            if (
                r < 0
                or r >= number_of_rows
                or c < 0
                or c >= number_of_columns
                or image[r][c] != old_color
            ):
                return

            image[r][c] = color

            for x, y in directions:
                dfs(r + x, c + y)

        dfs(sr, sc)
        return image
