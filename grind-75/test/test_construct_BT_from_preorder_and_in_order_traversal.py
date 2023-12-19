import unittest

from tree.common import BinaryTree
from tree.construct_BT_from_preorder_and_in_order_traversal import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        res = Solution.buildTree(preorder=[3, 9, 20, 15, 7], inorder=[9, 3, 15, 20, 7])
        res = BinaryTree.to_bfs_traversal_array(res)
        expected = [3, 9, 20, None, None, 15, 7]
        self.assertEqual(res, expected)

        res = Solution.buildTree(preorder=[-1], inorder=[-1])
        res = BinaryTree.to_bfs_traversal_array(res)
        expected = [-1]
        self.assertEqual(res, expected)
