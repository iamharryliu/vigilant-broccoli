import unittest
from backtracking.combination_sum import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        res = Solution.combinationSum(candidates=[2, 3, 6, 7], target=7)
        self.assertEqual(res, [[2, 2, 3], [7]])
        res = Solution.combinationSum(candidates=[2, 3, 5], target=8)
        self.assertEqual(res, [[2, 2, 2, 2], [2, 3, 3], [3, 5]])
        res = Solution.combinationSum(candidates=[2], target=1)
        self.assertEqual(res, [])
