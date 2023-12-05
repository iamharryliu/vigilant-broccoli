import unittest
from array.maximum_subarray import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        res = Solution.maxSubArray(nums=[-2, 1, -3, 4, -1, 2, 1, -5, 4])
        self.assertEqual(res, 6)
        res = Solution.maxSubArray([1])
        self.assertEqual(res, 1)
        res = Solution.maxSubArray(nums=[5, 4, -1, 7, 8])
        self.assertEqual(res, 23)


if __name__ == "__main__":
    unittest.main()
