class Solution:
    @classmethod
    def pacificAtlantic(self, heights):
        rows = len(heights)
        cols = len(heights[0])
        pacific = set()
        atlantic = set()

        def dfs(r, c, visited, previousHeight):
            if (
                (r, c) in visited  # already visited
                or r < 0  # out of bound conditions
                or c < 0
                or r == rows
                or c == cols
                or not (
                    heights[r][c] >= previousHeight
                )  # current value is not equal or greater than the previous value
            ):
                return
            # add to visited nodes and dfs adjacent nodes
            visited.add((r, c))
            dfs(r + 1, c, visited, heights[r][c])
            dfs(r - 1, c, visited, heights[r][c])
            dfs(r, c + 1, visited, heights[r][c])
            dfs(r, c - 1, visited, heights[r][c])

        # loop through first row and last row
        for n in range(rows):
            dfs(n, 0, pacific, heights[n][0])
            dfs(n, cols - 1, atlantic, heights[n][cols - 1])

        # loop through first column and first row
        for n in range(cols):
            dfs(0, n, pacific, heights[0][n])
            dfs(rows - 1, n, atlantic, heights[rows - 1][n])

        # check which values are in both Pacific and Atlantic sets and append to the result
        return pacific.intersection(atlantic)


test_value = [
    [1, 2, 2, 3, 5],
    [3, 2, 3, 4, 4],
    [2, 4, 5, 3, 1],
    [6, 7, 1, 4, 5],
    [5, 1, 1, 2, 4],
]
res = Solution.pacificAtlantic(test_value)
print(res)
