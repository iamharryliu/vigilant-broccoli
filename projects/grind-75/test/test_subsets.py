import unittest
from backtracking.subsets import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        res = Solution.subsets(nums=[1, 2, 3])
        expected = [[], [1], [2], [1, 2], [3], [1, 3], [2, 3], [1, 2, 3]]
        expected = sorted(expected)
        res = sorted(res)
        self.assertEqual(res, expected)

        res = Solution.subsets(nums=[0])
        expected = [[], [0]]
        expected = sorted(expected)
        res = sorted(res)
        self.assertEqual(res, expected)
