import unittest
from interval.insert_interval import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        res = Solution.insert(intervals=[[1, 3], [6, 9]], newInterval=[2, 5])
        self.assertEqual(res, [[1, 5], [6, 9]])
        res = Solution.insert(
            intervals=[[1, 2], [3, 5], [6, 7], [8, 10], [12, 16]], newInterval=[4, 8]
        )
        self.assertEqual(res, [[1, 2], [3, 10], [12, 16]])
