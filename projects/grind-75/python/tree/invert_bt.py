class Solution:
    @classmethod
    def invertTreeIterative(self, root):
        stack = [root]
        while stack:
            node = stack.pop()
            if node:
                node.left, node.right = node.right, node.left
                stack.append(node.left)
                stack.append(node.right)
        return root

    @classmethod
    def invertTreeRecursive(self, root):
        if root:
            root.left, root.right = (
                self.invertTreeRecursive(root.right),
                self.invertTreeRecursive(root.left),
            )
            return root
