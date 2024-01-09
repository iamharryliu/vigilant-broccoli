import unittest
from array.merge_intervals import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        res = Solution.merge(intervals=[[1, 3], [2, 6], [8, 10], [15, 18]])
        self.assertEqual(res, [[1, 6], [8, 10], [15, 18]])
        res = Solution.merge(intervals=[[1, 4], [4, 5]])
        self.assertEqual(res, [[1, 5]])
