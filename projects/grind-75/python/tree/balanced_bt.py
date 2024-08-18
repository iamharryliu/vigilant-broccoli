from typing import Optional
from tree.common import TreeNode


class Solution:
    @classmethod
    def isBalanced(self, root: Optional[TreeNode]) -> bool:
        isBalanced = True

        def dfs(node=root):
            nonlocal isBalanced
            if not node:
                return 0
            max_height_l = dfs(node.left)
            max_height_r = dfs(node.right)
            if abs(max_height_l - max_height_r) > 1:
                isBalanced = False
            return max(max_height_l, max_height_r) + 1

        dfs()
        return isBalanced
