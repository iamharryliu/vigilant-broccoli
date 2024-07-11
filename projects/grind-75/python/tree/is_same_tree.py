# Definition for a binary tree node.
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


class Solution:
    @classmethod
    def isSameTree(self, p, q):
        if p and q:
            return (
                p.val == q.val
                and self.isSameTree(p.left, q.left)
                and self.isSameTree(p.right, q.right)
            )
        return p is q


node1 = TreeNode(1)
node2 = TreeNode(2)
node3 = TreeNode(3)
node4 = TreeNode(4)
node5 = TreeNode(5)
node1.left = node2
node1.right = node3
node2.left = node4
node3.right = node5

tree1 = node1
tree2 = node1
tree3 = node2

result = Solution.isSameTree(tree1, tree2)
print(result)

result = Solution.isSameTree(tree1, tree3)
print(result)
