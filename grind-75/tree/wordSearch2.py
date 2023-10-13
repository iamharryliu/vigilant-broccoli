from typing import List


class TrieNode:
    def __init__(self):
        self.children = {}
        self.isEnd = False

    def insert(self, word):
        for c in word:
            if c not in self.children:
                self.children[c] = TrieNode()
            self = self.children[c]
        self.isEnd = True


class Solution:
    @classmethod
    def findWords(self, board: List[List[str]], words: List[str]) -> List[str]:
        root = TrieNode()
        for word in words:
            root.insert(word)
        res = set()
        visited = set()

        def dfs(r, c, node, word):

            # base cases
            if (
                r < 0
                or c < 0
                or r == len(board)
                or c == len(board[0])
                or (r, c) in visited
                or board[r][c] not in node.children
            ):
                return

            # add cell to visited, update node, update word
            visited.add((r, c))
            node = node.children[board[r][c]]
            word += board[r][c]

            if node.isEnd:
                res.add(word)

            dfs(r + 1, c, node, word)
            dfs(r - 1, c, node, word)
            dfs(r, c + 1, node, word)
            dfs(r, c - 1, node, word)

            # remove cell from visited
            visited.remove((r, c))

        # Loop through all squares and dfs
        for r in range(len(board)):
            for c in range(len(board[0])):
                dfs(r, c, root, "")
        return res


print(
    Solution.findWords(
        [
            ["o", "a", "a", "n"],
            ["e", "t", "a", "e"],
            ["i", "h", "k", "r"],
            ["i", "f", "l", "v"],
        ],
        ["oath", "pea", "eat", "rain"],
    )
    == {"oath", "eat"}
)

