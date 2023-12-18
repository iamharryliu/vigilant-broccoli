from typing import Optional
from tree.common import TreeNode


class Solution:
    @classmethod
    def diameterOfBinaryTree(self, root: Optional[TreeNode]) -> int:
        res = 0

        def dfs(node=root):
            nonlocal res
            if not node:
                return 0
            l = dfs(node.left)
            r = dfs(node.right)
            res = max(res, l + r)
            return max(l, r) + 1

        dfs()
        return res
