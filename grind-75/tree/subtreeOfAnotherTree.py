from typing import Optional


class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


class Solution:
    def isSubtree(self, root: Optional[TreeNode], subRoot: Optional[TreeNode]) -> bool:
        def isSameTree(n1, n2):
            if n1 and n2:
                return (
                    n1.val == n2.val
                    and isSameTree(n1.left, n2.left)
                    and isSameTree(n1.right, n2.right)
                )
            return n1 is n2

        if not root:
            return False
        return (
            isSameTree(root, subRoot)
            or self.isSubtree(root.left, subRoot)
            or self.isSubtree(root.right, subRoot)
        )

        # Merckle
        from hashlib import sha256

        def hashFn(x):
            S = sha256()
            S.update(x)
            return S.hexdigest()

        # merckle node
        def merkle(node):
            if not node:
                return "#"
            m_left = merkle(node.left)
            m_right = merkle(node.right)
            node.merkle = hashFn(m_left + str(node.val) + m_right)
            return node.merkle

        # merckle s and t
        merkle(s)
        merkle(t)

        # dfs to check if node merckle matches node merckle
        def dfs(node):
            if not node:
                return False
            return node.merkle == t.merkle or dfs(node.left) or dfs(node.right)

        return dfs(s)
