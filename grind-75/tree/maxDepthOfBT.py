from collections import deque


class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


class Solution:
    @classmethod
    def maxDepth(self, root):
        if not root:
            return 0

        # DFS
        leftMax = self.maxDepth(root.left)
        rightMax = self.maxDepth(root.right)
        return max(leftMax, rightMax) + 1


node1 = TreeNode(1)
node2 = TreeNode(2)
node3 = TreeNode(3)
node4 = TreeNode(4)
node5 = TreeNode(5)
node1.left = node2
node1.right = node3
node2.left = node4
node3.right = node5
print(Solution.maxDepth(node1) == 3)
