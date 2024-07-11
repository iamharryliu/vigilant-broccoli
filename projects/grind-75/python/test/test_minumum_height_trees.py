import unittest
from graph.minimum_height_trees import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        res = Solution.findMinHeightTrees(n=4, edges=[[1, 0], [1, 2], [1, 3]])

        self.assertEqual(res, [1])
        res = Solution.findMinHeightTrees(
            n=6, edges=[[3, 0], [3, 1], [3, 2], [3, 4], [5, 4]]
        )
        self.assertEqual(res, [3, 4])
