import unittest
from tree.common import BinaryTree, TreeNode
from tree.validate_bst import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        res = Solution.isValidBST(BinaryTree.array_to_tree(root=[2, 1, 3]))
        self.assertEqual(res, True)
        res = Solution.isValidBST(
            BinaryTree.array_to_tree(root=[5, 1, 4, None, None, 3, 6])
        )
        self.assertEqual(res, False)
