from typing import Optional
from tree.common import TreeNode


class Solution:
    @classmethod
    def isBalanced(self, root: Optional[TreeNode]) -> bool:
        res = True

        def dfs(node=root):
            nonlocal res
            if not node:
                return 0
            l = dfs(node.left)
            r = dfs(node.right)
            if abs(l - r) > 1:
                res = False
            return max(l, r) + 1

        dfs()
        return res
