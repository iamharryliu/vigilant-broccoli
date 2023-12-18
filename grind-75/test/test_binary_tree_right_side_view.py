import unittest
from tree.common import BinaryTree
from tree.binary_tree_right_side_view import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        # BFS
        res = Solution.rightSideViewBfs(
            BinaryTree.array_to_tree(root=[1, 2, 3, None, 5, None, 4])
        )
        self.assertEqual(res, [1, 3, 4])
        res = Solution.rightSideViewBfs(BinaryTree.array_to_tree(root=[1, None, 3]))
        self.assertEqual(res, [1, 3])
        res = Solution.rightSideViewBfs(BinaryTree.array_to_tree(root=[]))
        self.assertEqual(res, [])

        # DFS
        res = Solution.rightSideViewDfs(
            BinaryTree.array_to_tree(root=[1, 2, 3, None, 5, None, 4])
        )
        self.assertEqual(res, [1, 3, 4])
        res = Solution.rightSideViewDfs(BinaryTree.array_to_tree(root=[1, None, 3]))
        self.assertEqual(res, [1, 3])
        res = Solution.rightSideViewDfs(BinaryTree.array_to_tree(root=[]))
        self.assertEqual(res, [])
