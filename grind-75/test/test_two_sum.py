import unittest
from array.twoSum import Solution as TwoSumSolution


class TestStringMethods(unittest.TestCase):
    def test_two_sum(self):
        nums = [2, 7, 11, 15]
        target = 9
        expected = [0, 1]
        res = TwoSumSolution.twoSum(nums, target)
        self.assertEqual(res, expected)

        nums = [3, 2, 4]
        target = 6
        expected = [1, 2]
        res = TwoSumSolution.twoSum(nums, target)
        self.assertEqual(res, expected)

        nums = [3, 3]
        target = 6
        res = TwoSumSolution.twoSum(nums, target)
        expected = [0, 1]
        self.assertEqual(res, expected)


if __name__ == "__main__":
    unittest.main()
