import unittest
from tree.common import BinaryTree
from tree.BT_level_order_traversal import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        res = Solution.levelOrder(
            BinaryTree.array_to_tree(root=[3, 9, 20, None, None, 15, 7])
        )
        self.assertEqual(res, [[3], [9, 20], [15, 7]])
        res = Solution.levelOrder(BinaryTree.array_to_tree(root=[1]))
        self.assertEqual(res, [[1]])
        res = Solution.levelOrder(BinaryTree.array_to_tree(root=[]))
        self.assertEqual(res, [])


if __name__ == "__main__":
    unittest.main()
