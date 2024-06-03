import unittest
from tree.common import TreeNode, BinaryTree
from tree.lowest_common_ancestor_of_bt import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        p = TreeNode(5)
        q = TreeNode(1)
        expected = TreeNode(3)
        res = Solution.lowestCommonAncestor(
            BinaryTree.array_to_tree(
                root=[expected, p, q, 6, 2, 0, 8, None, None, 7, 4]
            ),
            p,
            q,
        )
        self.assertEqual(res.val, expected.val)

        p = TreeNode(5)
        q = TreeNode(4)
        expected = p
        res = Solution.lowestCommonAncestor(
            BinaryTree.array_to_tree(root=[3, p, 1, 6, 2, 0, 8, None, None, 7, q]), p, q
        )
        self.assertEqual(res.val, expected.val)
