import unittest
from dynamic_programming.combination_sum_iv import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        res = Solution.combinationSum4(nums=[1, 2, 3], target=4)
        expected = 7
        self.assertEqual(res, expected)
        res = Solution.combinationSum4(nums=[9], target=3)
        expected = 0
        self.assertEqual(res, expected)
