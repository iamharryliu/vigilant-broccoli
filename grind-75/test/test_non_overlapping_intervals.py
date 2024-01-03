import unittest
from interval.non_overlapping_intervals import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        res = Solution.eraseOverlapIntervals(intervals=[[1, 2], [2, 3], [3, 4], [1, 3]])
        expected = 1
        self.assertEqual(res, expected)
        res = Solution.eraseOverlapIntervals(intervals=[[1, 2], [1, 2], [1, 2]])
        expected = 2
        self.assertEqual(res, expected)
        res = Solution.eraseOverlapIntervals(intervals=[[1, 2], [2, 3]])
        expected = 0
        self.assertEqual(res, expected)
