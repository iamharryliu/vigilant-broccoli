class Solution:
    @classmethod
    def lowestCommonAncestorIterative(self, root, p, q):
        while root:
            if p.val < root.val and q.val < root.val:
                root = root.left
            elif root.val < p.val and root.val < q.val:
                root = root.right
            else:
                return root

    @classmethod
    def lowestCommonAncestorRecursive(self, root, p, q):
        if not root:
            return None
        if p.val < root.val and q.val < root.val:
            return self.lowestCommonAncestorRecursive(root.left, p, q)
        elif root.val < p.val and root.val < q.val:
            return self.lowestCommonAncestorRecursive(root.right, p, q)
        else:
            return root
