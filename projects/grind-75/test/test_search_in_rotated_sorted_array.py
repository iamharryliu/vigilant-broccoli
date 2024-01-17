import unittest
from binary_search.search_in_rotated_sorted_array import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        res = Solution.search(nums=[4, 5, 6, 7, 0, 1, 2], target=0)
        expected = 4
        self.assertEqual(res, expected)
        res = Solution.search(nums=[4, 5, 6, 7, 0, 1, 2], target=3)
        expected = -1
        self.assertEqual(res, expected)
        res = Solution.search(nums=[1], target=0)
        expected = -1
        self.assertEqual(res, expected)
