import unittest
from array.three_sum import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        res = Solution.threeSum(nums=[-1, -1, 0, 1, 2, -1, -4])
        self.assertEqual(res, [(-1, -1, 2), (-1, 0, 1)])
        res = Solution.threeSum(nums=[])
        self.assertEqual(res, [])
        res = Solution.threeSum(nums=[0])
        self.assertEqual(res, [])


if __name__ == "__main__":
    unittest.main()
