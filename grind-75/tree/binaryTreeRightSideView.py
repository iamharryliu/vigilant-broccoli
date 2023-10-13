from collections import deque
from typing import List, Optional

# Definition for a binary tree node.
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


class Solution:
    def rightSideViewDfs(self, root: Optional[TreeNode]) -> List[int]:
        res = []

        def dfs(node, i):
            if not node:
                return
            if i == len(res):
                res.append(node.val)
            dfs(node.right, i + 1)
            dfs(node.left, i + 1)

        dfs(root, 0)
        return res

    def rightSideViewBfs(self, root: Optional[TreeNode]) -> List[int]:
        res = []
        if not root:
            return res
        q = deque([root])
        while q:
            res.append(q[-1].val)
            for i in range(len(q)):
                node = q.popleft()
                if node.left:
                    q.append(node.left)
                if node.right:
                    q.append(node.right)
        return res
