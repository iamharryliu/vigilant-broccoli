class Solution:
    @classmethod
    def numIslands(self, grid):
        res = 0
        visited = set()

        def dfs(r, c):
            if (
                0 <= r < len(grid)
                and 0 <= c < len(grid[0])
                and grid[r][c] == "1"
                and (r, c) not in visited
            ):
                visited.add((r, c))
                for x, y in [[1, 0], [0, 1], [-1, 0], [0, -1]]:
                    nr = r + x
                    nc = c + y
                    dfs(nr, nc)

        for r in range(len(grid)):
            for c in range(len(grid[0])):
                if grid[r][c] == "1" and (r, c) not in visited:
                    res += 1
                    dfs(r, c)

        return res
