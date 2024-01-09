import unittest
from tree.kth_smallest_element_in_a_bst import Solution
from tree.common import BinaryTree


class TestSolution(unittest.TestCase):
    def test(self):
        root = [3, 1, 4, None, 2]
        k = 1
        res = Solution.kthSmallest(BinaryTree.array_to_tree(root), k)
        expected = 1
        self.assertEqual(res, expected)

        root = [5, 3, 6, 2, 4, None, None, 1]
        k = 3
        res = Solution.kthSmallest(BinaryTree.array_to_tree(root), k)
        expected = 3
        self.assertEqual(res, expected)
