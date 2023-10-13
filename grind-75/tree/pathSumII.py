# Definition for a binary tree node.
from typing import List, Optional


class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


class Solution:
    def pathSum(self, root: Optional[TreeNode], targetSum: int) -> List[List[int]]:
        res = []

        def dfs(node, curr):
            if not node:
                return
            curr = curr + [node.val]
            if not node.left and not node.right and curr and sum(curr) == targetSum:
                res.append(curr)
            else:
                dfs(node.left, curr)
                dfs(node.right, curr)

        dfs(root, [])
        return res
