import unittest
from array.two_sum import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        res = Solution.twoSum([2, 7, 11, 15], 9)
        expected = [0, 1]
        self.assertEqual(res, expected)
        res = Solution.twoSum([3, 2, 4], 6)
        expected = [1, 2]
        self.assertEqual(res, expected)
        res = Solution.twoSum([3, 3], 6)
        expected = [0, 1]
        self.assertEqual(res, expected)
