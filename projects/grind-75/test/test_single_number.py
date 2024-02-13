import unittest
from binary.single_number import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        res = Solution.singleNumber(nums=[2, 2, 1])
        expected = 1
        self.assertEqual(res, expected)
        res = Solution.singleNumber(nums=[4, 1, 2, 1, 2])
        expected = 4
        self.assertEqual(res, expected)
        res = Solution.singleNumber(nums=[1])
        expected = 1
        self.assertEqual(res, expected)
