import unittest
from array.squares_of_asorted_array import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        res = Solution.sortedSquares(nums=[-4, -1, 0, 3, 10])
        expected = [0, 1, 9, 16, 100]
        self.assertEqual(res, expected)
        res = Solution.sortedSquares(nums=[-7, -3, 2, 3, 11])
        expected = [4, 9, 9, 49, 121]
        self.assertEqual(res, expected)
