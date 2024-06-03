# Definition for a binary tree node.
from typing import Optional


class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


class Solution:
    @classmethod
    def kthSmallest(self, root: Optional[TreeNode], k: int) -> int:
        found = False

        def dfs(node):
            nonlocal found
            nonlocal k
            if not node or found:
                return
            left = dfs(node.left)
            k -= 1
            if k == 0:
                found = True
                return node.val
            right = dfs(node.right)
            return left or right or 0

        return dfs(root)

        # ITERATIVE SOLUTION
        # stack = []
        # while root or stack:
        #     while root:
        #         stack.append(root)
        #         root = root.left
        #     root = stack.pop()
        #     k -= 1
        #     if k == 0:
        #         return root.val
        #     root = root.right
