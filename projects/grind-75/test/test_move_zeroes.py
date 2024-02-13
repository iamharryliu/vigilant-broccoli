import unittest
from array.move_zeroes import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        nums = [0, 1, 0, 3, 12]
        Solution.moveZeroes(nums)
        expected = [1, 3, 12, 0, 0]
        self.assertEqual(nums, expected)
        nums = [0]
        Solution.moveZeroes(nums)
        expected = [0]
        self.assertEqual(nums, expected)
