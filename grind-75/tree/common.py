from collections import deque


class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


class BinaryTree:
    @staticmethod
    def array_to_tree(root):
        if not root:
            return None

        nodes = [
            TreeNode(num) if num is not None else None for num in root
        ]  # Create TreeNode objects

        # Assign children nodes to parent nodes according to the array structure
        for i in range(len(root)):
            left_index = 2 * i + 1
            right_index = 2 * i + 2

            if left_index < len(root):
                nodes[i].left = nodes[left_index]

            if right_index < len(root):
                nodes[i].right = nodes[right_index]

        return nodes[0]  # Return the root node

    @staticmethod
    def to_bfs_traversal_array(root):
        res = []
        if not root:
            return res
        queue = deque()
        queue.append(root)
        while queue:
            current = queue.popleft()
            res.append(current.val)
            if current.left:
                queue.append(current.left)
            if current.right:
                queue.append(current.right)
        return res
