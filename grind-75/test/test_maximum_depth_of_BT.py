import unittest
from tree.common import BinaryTree
from tree.maximum_depth_of_binary_tree import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        res = Solution.maxDepth(
            BinaryTree.array_to_tree(root=[3, 9, 20, None, None, 15, 7])
        )
        self.assertEqual(res, 3)
        res = Solution.maxDepth(BinaryTree.array_to_tree(root=[1, None, 2]))
        self.assertEqual(res, 2)


if __name__ == "__main__":
    unittest.main()
