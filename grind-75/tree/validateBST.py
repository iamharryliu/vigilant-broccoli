# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def isValidBST(self, root, ceiling=float("inf"), floor=float("-inf")):
        # not node
        if not root:
            return True
        # node is greater/less than floor/ceiling
        if root.val <= floor or root.val >= ceiling:
            return False
        # recursively check isValidBST of both left and right nodes
        leftSideValid = self.isValidBST(root.left, root.val, floor)
        rightSideValid = self.isValidBST(root.right, ceiling, root.val)
        return leftSideValid and rightSideValid

