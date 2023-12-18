import unittest
from tree.common import BinaryTree, TreeNode
from tree.lowest_common_ancestor_of_BST import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        # iterative
        res = Solution.lowestCommonAncestorIterative(
            BinaryTree.array_to_tree(root=[6, 2, 8, 0, 4, 7, 9, None, None, 3, 5]),
            p=TreeNode(6),
            q=TreeNode(8),
        )
        self.assertEqual(res.val, 6)
        res = Solution.lowestCommonAncestorIterative(
            BinaryTree.array_to_tree(root=[6, 2, 8, 0, 4, 7, 9, None, None, 3, 5]),
            p=TreeNode(2),
            q=TreeNode(4),
        )
        self.assertEqual(res.val, 2)
        res = Solution.lowestCommonAncestorIterative(
            BinaryTree.array_to_tree(root=[2, 1]), p=TreeNode(2), q=TreeNode(1)
        )
        self.assertEqual(res.val, 2)

        # recursive
        res = Solution.lowestCommonAncestorRecursive(
            BinaryTree.array_to_tree(root=[6, 2, 8, 0, 4, 7, 9, None, None, 3, 5]),
            p=TreeNode(6),
            q=TreeNode(8),
        )
        self.assertEqual(res.val, 6)
        res = Solution.lowestCommonAncestorRecursive(
            BinaryTree.array_to_tree(root=[6, 2, 8, 0, 4, 7, 9, None, None, 3, 5]),
            p=TreeNode(2),
            q=TreeNode(4),
        )
        self.assertEqual(res.val, 2)
        res = Solution.lowestCommonAncestorRecursive(
            BinaryTree.array_to_tree(root=[2, 1]), p=TreeNode(2), q=TreeNode(1)
        )
        self.assertEqual(res.val, 2)
