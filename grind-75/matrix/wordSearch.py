class Solution:
    @classmethod
    def exist(self, board, word):
        visited = set()

        def dfs(r, c, i):
            if (
                0 <= r < len(board)
                and 0 <= c < len(board[0])
                and (r, c) not in visited
                and board[r][c] == word[i]
            ):
                if i == len(word) - 1:
                    return True
                visited.add((r, c))
                res = (
                    dfs(r + 1, c, i + 1)
                    or dfs(r - 1, c, i + 1)
                    or dfs(r, c + 1, i + 1)
                    or dfs(r, c - 1, i + 1)
                )
                visited.remove((r, c))
                return res

        for r in range(len(board)):
            for c in range(len(board[0])):
                if dfs(r, c, 0):
                    return True
        return False


board = [["A", "B", "C", "E"], ["S", "F", "C", "S"], ["A", "D", "E", "E"]]
word = "ABCCED"
output = True
res = Solution.exist(board, word)
print(res == output)

board = [["A", "B", "C", "E"], ["S", "F", "C", "S"], ["A", "D", "E", "E"]]
word = "SEE"
output = True
res = Solution.exist(board, word)
print(res == output)

board = [["A", "B", "C", "E"], ["S", "F", "C", "S"], ["A", "D", "E", "E"]]
word = "ABCB"
output = False
res = Solution.exist(board, word)
print(res == output)
