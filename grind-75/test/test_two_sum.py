import unittest
from array.two_sum import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        res = Solution.twoSum([2, 7, 11, 15], 9)
        self.assertEqual(res, [0, 1])
        res = Solution.twoSum([3, 2, 4], 6)
        self.assertEqual(res, [1, 2])
        res = Solution.twoSum([3, 3], 6)
        self.assertEqual(res, [0, 1])


if __name__ == "__main__":
    unittest.main()
