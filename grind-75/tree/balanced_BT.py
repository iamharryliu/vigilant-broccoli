from typing import Optional
from tree.common import TreeNode


class Solution:
    @classmethod
    def isBalanced(self, root: Optional[TreeNode]) -> bool:
        res = True

        def dfs(node):
            nonlocal res
            if not node:
                return 0
            l = dfs(node.left)
            r = dfs(node.right)
            if abs(l - r) > 1:
                res = False
            return max(l, r) + 1

        dfs(root)
        return res

        # Alternate solution
        # if not root:
        #     return True

        # def height(root):
        #     if not root:
        #         return 0
        #     return 1 + max(height(root.left), height(root.right))

        # left = height(root.left)
        # right = height(root.right)

        # return (
        #     abs(left - right) < 2
        #     and self.isBalanced(root.left)
        #     and self.isBalanced(root.right)
        # )
