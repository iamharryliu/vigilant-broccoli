import collections


class Solution:
    @classmethod
    def invertTreeRecursive(self, root):
        if root:
            root.left, root.right = (
                self.invertTreeRecursive(root.right),
                self.invertTreeRecursive(root.left),
            )
            return root

    @classmethod
    def invertTreeIterative(self, root):
        stack = [root]
        while stack:
            node = stack.pop()
            if node:
                node.left, node.right = node.right, node.left
                stack.extend([node.left, node.right])
        return root
