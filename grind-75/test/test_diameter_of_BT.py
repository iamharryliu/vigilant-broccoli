import unittest
from tree.common import BinaryTree
from tree.diameter_of_BT import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        res = Solution.diameterOfBinaryTree(
            BinaryTree.array_to_tree(root=[1, 2, 3, 4, 5])
        )
        self.assertEqual(res, 3)
        res = Solution.diameterOfBinaryTree(BinaryTree.array_to_tree(root=[1, 2]))
        self.assertEqual(res, 1)


if __name__ == "__main__":
    unittest.main()
