import unittest
from binary_search.maximum_profit_in_job_scheduling import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        res = Solution.jobScheduling(
            startTime=[1, 2, 3, 3], endTime=[3, 4, 5, 6], profit=[50, 10, 40, 70]
        )
        expected = 120
        self.assertEqual(res, expected)
        res = Solution.jobScheduling(
            startTime=[1, 2, 3, 4, 6],
            endTime=[3, 5, 10, 6, 9],
            profit=[20, 20, 100, 70, 60],
        )
        expected = 150
        self.assertEqual(res, expected)
        res = Solution.jobScheduling(
            startTime=[1, 1, 1], endTime=[2, 3, 4], profit=[5, 6, 4]
        )
        expected = 6
        self.assertEqual(res, expected)
