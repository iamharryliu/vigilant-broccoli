import unittest
from dynamic_programming.unique_paths import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        result = Solution.uniquePaths(m=3, n=7)
        expected = 28
        self.assertEqual(result, expected)

        result = Solution.uniquePaths(m=3, n=2)
        expected = 3
        self.assertEqual(result, expected)
