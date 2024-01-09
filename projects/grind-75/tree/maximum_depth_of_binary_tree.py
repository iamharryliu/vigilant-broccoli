class Solution:
    @classmethod
    def maxDepth(self, root):
        if not root:
            return 0
        leftMax = self.maxDepth(root.left)
        rightMax = self.maxDepth(root.right)
        return max(leftMax, rightMax) + 1
