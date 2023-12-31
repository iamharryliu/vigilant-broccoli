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

        nodes = []

        for val in root:
            if val is None:
                nodes.append(None)
            elif isinstance(val, int):
                nodes.append(TreeNode(val))
            else:
                nodes.append(val)

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
        while queue and not all(node is None for node in queue):
            node = queue.popleft()
            if node:
                res.append(node.val)
                queue.append(node.left if node.left else None)
                queue.append(node.right if node.right else None)
            else:
                res.append(None)
        return res
