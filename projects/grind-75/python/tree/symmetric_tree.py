# Definition for a binary tree node.
from typing import Optional


class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


class Solution:
    def isSymmetric(self, root: Optional[TreeNode]) -> bool:
        def dfs(l, r):
            if l and r:
                return l.val == r.val and dfs(l.left, r.right) and dfs(l.right, r.left)
            return l is r

        return dfs(root, root)
