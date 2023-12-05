from typing import Optional
from tree.common import TreeNode


class Solution:
    @classmethod
    def diameterOfBinaryTree(self, root: Optional[TreeNode]) -> int:
        res = 0

        def dfs(root):
            nonlocal res
            if not root:
                return 0
            l = dfs(root.left)
            r = dfs(root.right)
            res = max(res, l + r)
            return max(l, r) + 1

        dfs(root)
        return res
