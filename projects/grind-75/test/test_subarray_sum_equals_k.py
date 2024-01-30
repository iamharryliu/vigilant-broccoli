import unittest
from array.subarray_sum_equals_k import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        res = Solution.subarraySum(nums=[1, 1, 1], k=2)
        expected = 2
        self.assertEqual(res, expected)
        res = Solution.subarraySum(nums=[1, 2, 3], k=3)
        expected = 2
        self.assertEqual(res, expected)
