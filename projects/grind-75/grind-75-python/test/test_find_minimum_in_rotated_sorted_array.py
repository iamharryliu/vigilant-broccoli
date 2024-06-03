import unittest
from binary_search.find_minimum_in_rotated_sorted_array import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        res = Solution.findMin(nums=[3, 4, 5, 1, 2])
        expected = 1
        self.assertEqual(res, expected)
        res = Solution.findMin(nums=[4, 5, 6, 7, 0, 1, 2])
        expected = 0
        self.assertEqual(res, expected)
        res = Solution.findMin(nums=[11, 13, 15, 17])
        expected = 11
        self.assertEqual(res, expected)
