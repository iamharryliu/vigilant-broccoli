import unittest
from graph.rotting_oranges import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        res = Solution.orangesRotting(grid=[[2, 1, 1], [1, 1, 0], [0, 1, 1]])
        self.assertEqual(res, 4)
        res = Solution.orangesRotting(grid=[[2, 1, 1], [0, 1, 1], [1, 0, 1]])
        self.assertEqual(res, -1)
        res = Solution.orangesRotting(grid=[[0, 2]])
        self.assertEqual(res, 0)
