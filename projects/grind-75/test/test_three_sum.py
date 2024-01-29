import unittest
from array.three_sum import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        res = Solution.threeSum(nums=[-1, -1, 0, 1, 2, -1, -4])
        expected = [(-1, -1, 2), (-1, 0, 1)]
        self.assertEqual(res, expected)
        res = Solution.threeSum(nums=[])
        expected = []
        self.assertEqual(res, expected)
        res = Solution.threeSum(nums=[0])
        expected = []
        self.assertEqual(res, expected)
