import unittest
from binary.missing_number import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        res = Solution.missingNumber(nums=[3, 0, 1])
        expected = 2
        self.assertEqual(res, expected)
        res = Solution.missingNumber(nums=[0, 1])
        expected = 2
        self.assertEqual(res, expected)
        res = Solution.missingNumber(nums=[9, 6, 4, 2, 3, 5, 7, 0, 1])
        expected = 8
        self.assertEqual(res, expected)
