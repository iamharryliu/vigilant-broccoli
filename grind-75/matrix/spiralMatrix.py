from black import out


class Solution:
    @classmethod
    def spiralOrder(self, matrix):
        visited = set()
        res = []

        def dfs(r, c):
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

        dfs(0, 0)
        return res


matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
output = [1, 2, 3, 6, 9, 8, 7, 4, 5]
res = Solution.spiralOrder(matrix)
print(res == output)

matrix = [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]
output = [1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7]
res = Solution.spiralOrder(matrix)
print(res == output)
