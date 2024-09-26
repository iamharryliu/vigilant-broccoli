from typing import List
from collections import deque


class Solution:
    @classmethod
    def floodFill(
        self, image: List[List[int]], sr: int, sc: int, color: int
    ) -> List[List[int]]:
        old_color = image[sr][sc]

        if old_color == color:
            return image

        directions = [[1, 0], [-1, 0], [0, 1], [0, -1]]
        queue = deque([(sr, sc)])

        while queue:
            r, c = queue.popleft()
            image[r][c] = color

            for x, y in directions:
                nr = r + x
                nc = c + y

                if (
                    0 <= nr < len(image)
                    and 0 <= nc < len(image[0])
                    and image[nr][nc] == old_color
                ):
                    queue.append((nr, nc))

        return image
