import unittest
from dynamic_programming.partition_equal_subset_sum import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        res = Solution.canPartition(nums=[1, 5, 11, 5])
        self.assertEqual(res, True)
        res = Solution.canPartition(nums=[1, 2, 3, 5])
        self.assertEqual(res, False)
