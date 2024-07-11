# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    @classmethod
    def maxPathSum(self, root):
        # return value
        max_path = float("-inf")

        def dfsMax(root):
            # used to access max_path variable
            nonlocal max_path

            if root is None:
                return 0

            # get maxes of left and right nodes
            maxLeft = max(dfsMax(root.left), 0)
            maxRight = max(dfsMax(root.right), 0)

            # compare max_path and current_max_path
            max_path = max(max_path, root.val + maxLeft + maxRight)

            # return current value + greater path node
            return root.val + max(maxLeft, maxRight)

        # initiate recursion
        dfsMax(root)
        return max_path
