import unittest
from array.product_of_array_except_self import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        res = Solution.productExceptSelf([1, 2, 3, 4])
        self.assertEqual(res, [24, 12, 8, 6])
        res = Solution.productExceptSelf([-1, 1, 0, -3, 3])
        self.assertEqual(res, [0, 0, 9, 0, 0])
