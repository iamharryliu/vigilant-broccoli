import unittest
from array.sort_colors import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        nums = [2, 0, 2, 1, 1, 0]
        Solution.sortColors(nums)
        self.assertEqual(nums, [0, 0, 1, 1, 2, 2])
        nums = [2, 0, 1]
        Solution.sortColors(nums)
        self.assertEqual(nums, [0, 1, 2])
