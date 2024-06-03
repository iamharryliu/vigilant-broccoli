import unittest
from array.container_with_most_water import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        result = Solution.maxArea(height=[1, 8, 6, 2, 5, 4, 8, 3, 7])
        expected = 49
        self.assertEqual(result, expected)

        result = Solution.maxArea(height=[1, 1])
        expected = 1
        self.assertEqual(result, expected)
