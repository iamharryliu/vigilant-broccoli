class Solution:
    @classmethod
    def numIslands(self, grid):
        visited = set()

        def dfs(r, c):
            if (
                0 <= r < len(grid)
                and 0 <= c < len(grid[0])
                and grid[r][c] == "1"
                and (r, c) not in visited
            ):
                visited.add((r, c))
                dfs(r + 1, c)
                dfs(r - 1, c)
                dfs(r, c + 1)
                dfs(r, c - 1)

        res = 0
        for r in range(len(grid)):
            for c in range(len(grid[0])):
                if grid[r][c] == "1" and (r, c) not in visited:
                    res += 1
                    dfs(r, c)
        return res


grid = [
    ["1", "1", "1", "1", "0"],
    ["1", "1", "0", "1", "0"],
    ["1", "1", "0", "0", "0"],
    ["0", "0", "0", "0", "0"],
]
output = 1
res = Solution.numIslands(grid)
print(res == output)


grid = [
    ["1", "1", "0", "0", "0"],
    ["1", "1", "0", "0", "0"],
    ["0", "0", "1", "0", "0"],
    ["0", "0", "0", "1", "1"],
]
output = 3
res = Solution.numIslands(grid)
print(res == output)
