import unittest
from stack.largest_rectangle_in_histogram import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        res = Solution.largestRectangleArea(heights=[2, 1, 5, 6, 2, 3])
        expected = 10
        self.assertEqual(res, 10)
        res = Solution.largestRectangleArea(heights=[2, 4])
        expected = 4
        self.assertEqual(res, expected)
