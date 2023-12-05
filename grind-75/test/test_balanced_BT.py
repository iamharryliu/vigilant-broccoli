import unittest
from tree.common import BinaryTree
from tree.balanced_BT import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        res = Solution.isBalanced(
            BinaryTree.array_to_tree(root=[3, 9, 20, None, None, 15, 7])
        )
        self.assertEqual(res, True)
        res = Solution.isBalanced(
            BinaryTree.array_to_tree(root=[1, 2, 2, 3, 3, None, None, 4, 4])
        )
        self.assertEqual(res, False)
        res = Solution.isBalanced(BinaryTree.array_to_tree(root=[]))
        self.assertEqual(res, True)


if __name__ == "__main__":
    unittest.main()
