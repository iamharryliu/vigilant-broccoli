import unittest
from tree.common import BinaryTree
from tree.invert_BT import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        res = Solution.invertTree(BinaryTree.array_to_tree(root=[4, 2, 7, 1, 3, 6, 9]))
        self.assertEqual(BinaryTree.to_bfs_traversal_array(res), [4, 7, 2, 9, 6, 3, 1])
        res = Solution.invertTree(BinaryTree.array_to_tree(root=[2, 1, 3]))
        self.assertEqual(BinaryTree.to_bfs_traversal_array(res), [2, 3, 1])
