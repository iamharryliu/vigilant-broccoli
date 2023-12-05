import collections


class Solution:
    # recursive
    @classmethod
    def invertTree(self, root):
        if root:
            root.left, root.right = (
                self.invertTree(root.right),
                self.invertTree(root.left),
            )
            return root

    # stack
    @classmethod
    def invertTree(self, root):
        if not root:
            return root
        stack = [root]
        while stack:
            node = stack.pop()
            if node:
                node.left, node.right = node.right, node.left
                stack.extend([node.right, node.left])
        return root

    # queue
    @classmethod
    def invertTree(self, root):
        queue = collections.deque([(root)])
        while queue:
            node = queue.popleft()
            if node:
                node.left, node.right = node.right, node.left
                queue.append(node.left)
                queue.append(node.right)
        return root
