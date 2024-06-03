import unittest
from array.largest_number import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        res = Solution.largestNumber(nums=[10, 2])
        expected = "210"
        self.assertEqual(res, expected)
        res = Solution.largestNumber(nums=[3, 30, 34, 5, 9])
        expected = "9534330"
        self.assertEqual(res, expected)
