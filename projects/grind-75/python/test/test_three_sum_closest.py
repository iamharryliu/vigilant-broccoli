import unittest
from array.three_sum_closest import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        res = Solution.threeSumClosest(nums=[-1, 2, 1, -4], target=1)
        expected = 2
        self.assertEqual(res, expected)
        res = Solution.threeSumClosest(nums=[0, 0, 0], target=1)
        expected = 0
        self.assertEqual(res, expected)
