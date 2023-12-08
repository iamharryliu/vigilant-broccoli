import unittest
from binary_search.seatch_in_rotated_sorted_array import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        res = Solution.search(nums=[4, 5, 6, 7, 0, 1, 2], target=0)
        self.assertEqual(res, 4)
        res = Solution.search(nums=[4, 5, 6, 7, 0, 1, 2], target=3)
        self.assertEqual(res, -1)
        res = Solution.search(nums=[1], target=0)
        self.assertEqual(res, -1)
